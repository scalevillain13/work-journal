import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import {
  entryQuerySchema,
  entrySchema,
  formatZodErrors,
} from "../validation/entry";

const router = Router();

function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatEntry(entry: {
  id: number;
  performedAt: Date;
  workTypeId: number;
  volume: Prisma.Decimal;
  executorName: string;
  createdAt: Date;
  updatedAt: Date;
  workType: { id: number; name: string; unit: string };
}) {
  return {
    id: entry.id,
    performedAt: entry.performedAt.toISOString().slice(0, 10),
    workTypeId: entry.workTypeId,
    volume: Number(entry.volume),
    executorName: entry.executorName,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    workType: entry.workType,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const parsed = entryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ errors: formatZodErrors(parsed.error) });
    }

    const { dateFrom, dateTo, order } = parsed.data;

    const where: Prisma.JournalEntryWhereInput = {};

    if (dateFrom || dateTo) {
      where.performedAt = {};
      if (dateFrom) {
        where.performedAt.gte = parseDateOnly(dateFrom);
      }
      if (dateTo) {
        where.performedAt.lte = parseDateOnly(dateTo);
      }
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      include: { workType: true },
      orderBy: { performedAt: order },
    });

    res.json(entries.map(formatEntry));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ errors: [{ field: "id", message: "Некорректный ID" }] });
    }

    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: { workType: true },
    });

    if (!entry) {
      return res.status(404).json({ errors: [{ field: "id", message: "Запись не найдена" }] });
    }

    res.json(formatEntry(entry));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = entrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: formatZodErrors(parsed.error) });
    }

    const { performedAt, workTypeId, volume, executorName } = parsed.data;

    const workType = await prisma.workType.findUnique({ where: { id: workTypeId } });
    if (!workType) {
      return res.status(400).json({
        errors: [{ field: "workTypeId", message: "Вид работ не найден" }],
      });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        performedAt: parseDateOnly(performedAt),
        workTypeId,
        volume,
        executorName: executorName.trim(),
      },
      include: { workType: true },
    });

    res.status(201).json(formatEntry(entry));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ errors: [{ field: "id", message: "Некорректный ID" }] });
    }

    const parsed = entrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: formatZodErrors(parsed.error) });
    }

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ errors: [{ field: "id", message: "Запись не найдена" }] });
    }

    const { performedAt, workTypeId, volume, executorName } = parsed.data;

    const workType = await prisma.workType.findUnique({ where: { id: workTypeId } });
    if (!workType) {
      return res.status(400).json({
        errors: [{ field: "workTypeId", message: "Вид работ не найден" }],
      });
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        performedAt: parseDateOnly(performedAt),
        workTypeId,
        volume,
        executorName: executorName.trim(),
      },
      include: { workType: true },
    });

    res.json(formatEntry(entry));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ errors: [{ field: "id", message: "Некорректный ID" }] });
    }

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ errors: [{ field: "id", message: "Запись не найдена" }] });
    }

    await prisma.journalEntry.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
