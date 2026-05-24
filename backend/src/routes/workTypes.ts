import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const workTypes = await prisma.workType.findMany({
      orderBy: { name: "asc" },
    });
    res.json(workTypes);
  } catch (error) {
    next(error);
  }
});

export default router;
