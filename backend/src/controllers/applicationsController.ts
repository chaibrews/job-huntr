import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// Takes a full application object (with nested company) and flattens it into a simpler shape.
function flattenApplication(app: any) {
  const { company, ...rest } = app;
  return {
    ...rest,
    company: company.name,
    location: company.location ?? null,
    companyNotes: company.notes ?? null,
  };
}

// Validation schema for creating/updating an application.
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
  companyNotes: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
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
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: {
        select: { name: true, location: true, notes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(applications.map(flattenApplication));
};

// ── CREATE ────────────────────────────────────────────
export const createApplication = async (req: AuthRequest, res: Response) => {
  const parsed = ApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tags: tagInputs, ...appData } = parsed.data;

  let company = await prisma.company.findFirst({
    where: { name: appData.company },
  });

  if (company) {
    if (appData.location !== company.location) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { location: appData.location, notes: appData.companyNotes },
      });
    }
  } else {
    company = await prisma.company.create({
      data: {
        name: appData.company,
        location: appData.location,
        notes: appData.companyNotes,
      },
    });
  }

  const {
    company: companyName,
    location,
    companyNotes,
    ...appFields
  } = appData;

  const application = await prisma.application.create({
    data: {
      ...appFields,
      userId: req.userId!,
      companyId: company.id,
      statusHistory: {
        create: {
          from: appFields.status ?? "SAVED",
          to: appFields.status ?? "SAVED",
        },
      },
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
    include: {
      statusHistory: true,
      tags: true,
      company: { select: { name: true, location: true, notes: true } },
    },
  });

  res.status(201).json(flattenApplication(application));
};

// ── GET ONE ───────────────────────────────────────────
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  const application = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: {
        select: { name: true, location: true, notes: true },
      },
    },
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(flattenApplication(application));
};

// ── UPDATE FIELDS ─────────────────────────────────────
export const updateApplication = async (req: AuthRequest, res: Response) => {
  const parsed = ApplicationBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Verify ownership before updating
  const existing = await prisma.application.findFirst({
    where: { id: String(req.params.id), userId: req.userId },
    include: { company: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const {
    tags: tagInputs,
    company: companyName,
    location,
    companyNotes,
    ...appFields
  } = parsed.data;

  // If company name or location or notes changed, update the Company record
  if (
    companyName !== undefined ||
    location !== undefined ||
    companyNotes !== undefined
  ) {
    await prisma.company.update({
      where: { id: existing.companyId },
      data: {
        ...(companyName !== undefined && { name: companyName }),
        ...(location !== undefined && { location }),
        ...(companyNotes !== undefined && { notes: companyNotes }),
      },
    });
  }

  const application = await prisma.application.update({
    where: { id: String(req.params.id) },
    data: {
      ...appFields,
      ...(tagInputs
        ? {
            tags: {
              deleteMany: {},
              create: tagInputs.map((t) => ({
                name: t.name,
                color: t.color,
                userId: req.userId!,
              })),
            },
          }
        : undefined),
    },
    include: {
      statusHistory: { orderBy: { changedAt: "asc" } },
      tags: true,
      company: { select: { name: true, location: true, notes: true } },
    },
  });

  res.json(flattenApplication(application));
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

  const [application] = await prisma.$transaction([
    prisma.application.update({
      where: { id: String(req.params.id) },
      data: { status: parsed.data.status },
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        tags: true,
        company: { select: { name: true, location: true, notes: true } },
      },
    }),
    prisma.statusHistory.create({
      data: {
        applicationId: String(req.params.id),
        from: existing.status,
        to: parsed.data.status,
      },
    }),
  ]);

  res.json(flattenApplication(application));
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

  await prisma.application.delete({ where: { id: String(req.params.id) } });

  res.status(204).send();
};
