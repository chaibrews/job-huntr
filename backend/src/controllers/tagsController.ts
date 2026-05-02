import { Response } from "express";
import { prisma } from "../libs/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET /api/tags — all tags belonging to this user
export const getUserTags = async (req: AuthRequest, res: Response) => {
  const tags = await prisma.tag.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
    distinct: ["name"], // ← only return one tag per unique name
  });
  res.json(tags);
};
