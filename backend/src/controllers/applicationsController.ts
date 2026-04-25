import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// Validation schema for creating/updating an application.
// .optional() means the field can be omitted entirely.
// .nullable() means the field can be explicitly set to null.
const ApplicationBody = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  status: z
    .enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "ARCHIVED"])
    .optional(),
  workSetup: z.enum(["ONSITE", "HYBRID", "REMOTE"]).nullable().optional(),
  location: z.string().nullable().optional(),
  appliedAt: z.string().datetime().nullable().optional(),
  url: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  // Tags sent from the form as inline objects
  tags: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string(),
      }),
    )
    .optional(),
});

// Schema specifically for status updates
const StatusBody = z.object({
  status: z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "ARCHIVED",
  ]),
});

// ── GET ALL ───────────────────────────────────────────
export const getApplications = async (req: AuthRequest, res: Response) => {
  // findMany fetches all rows matching the where clause.
  // where: { userId: req.userId } means only this user's applications.
  // include: { statusHistory } joins the related StatusHistory rows.
  // orderBy: { createdAt: "desc" } returns newest first.
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    include: { statusHistory: { orderBy: { changedAt: "asc" } }, tags: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(applications);
};

// ── CREATE ────────────────────────────────────────────
export const createApplication = async (req: AuthRequest, res: Response) => {
  const parsed = ApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tags: tagInputs, ...appData } = parsed.data;

  const application = await prisma.application.create({
    data: {
      ...appData,
      userId: req.userId!,
      // Create tags and connect them in one operation
      tags:
        tagInputs && tagInputs.length > 0
          ? {
              create: tagInputs.map((t) => ({
                name: t.name,
                color: t.color,
                userId: req.userId!,
              })),
            }
          : undefined,
    },
    include: { statusHistory: true, tags: true },
  });

  res.status(201).json(application);
};

// ── GET ONE ───────────────────────────────────────────
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  // findFirst with both id AND userId — this prevents a user from
  // accessing another user's application by guessing the ID.
  // If the ID exists but belongs to someone else, this returns null.
  const application = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
    include: { statusHistory: { orderBy: { changedAt: "asc" } }, tags: true },
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(application);
};

// ── UPDATE FIELDS ─────────────────────────────────────
export const updateApplication = async (req: AuthRequest, res: Response) => {
  // .partial() makes all fields optional — useful for PATCH
  // where the client only sends the fields they want to change
  const parsed = ApplicationBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Verify ownership before updating
  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await prisma.application.update({
    where: { id: String(req.params.id) },
    data: parsed.data,
    include: { statusHistory: { orderBy: { changedAt: "asc" } }, tags: true },
  });

  res.json(application);
};

// ── UPDATE STATUS ─────────────────────────────────────
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  const parsed = StatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // $transaction runs multiple DB operations atomically.
  // If either operation fails, both are rolled back —
  // you'll never end up with a status update without a history record,
  // or a history record for a status that didn't actually change.
  const [application] = await prisma.$transaction([
    prisma.application.update({
      where: { id: String(req.params.id) },
      data: { status: parsed.data.status },
      include: { statusHistory: { orderBy: { changedAt: "asc" } }, tags: true },
    }),
    prisma.statusHistory.create({
      data: {
        applicationId: String(req.params.id),
        from: existing.status, // the current status before changing
        to: parsed.data.status, // the new status
      },
    }),
  ]);

  res.json(application);
};

// ── DELETE ─────────────────────────────────────────────
export const deleteApplication = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  // StatusHistory rows are deleted automatically because of
  // onDelete: Cascade in the Prisma schema — no need to delete
  // them manually first.
  await prisma.application.delete({ where: { id: String(req.params.id) } });

  // 204 No Content — success, but nothing to return
  res.status(204).send();
};
