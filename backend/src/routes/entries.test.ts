import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const {
  mockFindMany,
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("../prisma", () => ({
  prisma: {
    journalEntry: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
    workType: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const sampleWorkType = {
  id: 1,
  name: "Кладка перегородок",
  unit: "м³",
};

const sampleEntry = {
  id: 1,
  performedAt: new Date("2025-05-24T00:00:00.000Z"),
  workTypeId: 1,
  volume: { toString: () => "24", valueOf: () => 24 },
  executorName: "Иванов Иван Иванович",
  createdAt: new Date("2025-05-24T10:00:00.000Z"),
  updatedAt: new Date("2025-05-24T10:00:00.000Z"),
  workType: sampleWorkType,
};

describe("entries API", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/entries returns formatted entries", async () => {
    mockFindMany.mockResolvedValue([sampleEntry]);

    const response = await request(app).get("/api/entries?order=desc");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        performedAt: "2025-05-24",
        workTypeId: 1,
        volume: 24,
        executorName: "Иванов Иван Иванович",
        createdAt: sampleEntry.createdAt.toISOString(),
        updatedAt: sampleEntry.updatedAt.toISOString(),
        workType: sampleWorkType,
      },
    ]);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { performedAt: "desc" },
      })
    );
  });

  it("GET /api/entries/:id returns 404 when entry is missing", async () => {
    mockFindUnique.mockResolvedValue(null);

    const response = await request(app).get("/api/entries/999");

    expect(response.status).toBe(404);
    expect(response.body.errors[0].message).toBe("Запись не найдена");
  });

  it("POST /api/entries validates request body", async () => {
    const response = await request(app).post("/api/entries").send({
      performedAt: "2025-05-24",
      volume: 24,
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "workTypeId" }),
        expect.objectContaining({ field: "executorName" }),
      ])
    );
  });

  it("POST /api/entries creates entry when data is valid", async () => {
    const { prisma } = await import("../prisma");
    vi.mocked(prisma.workType.findUnique).mockResolvedValue(sampleWorkType);
    mockCreate.mockResolvedValue(sampleEntry);

    const response = await request(app).post("/api/entries").send({
      performedAt: "2025-05-24",
      workTypeId: 1,
      volume: 24,
      executorName: "Иванов Иван Иванович",
    });

    expect(response.status).toBe(201);
    expect(response.body.executorName).toBe("Иванов Иван Иванович");
    expect(mockCreate).toHaveBeenCalled();
  });

  it("PUT /api/entries/:id updates existing entry", async () => {
    const updatedEntry = {
      ...sampleEntry,
      volume: { toString: () => "30", valueOf: () => 30 },
      updatedAt: new Date("2025-05-24T11:00:00.000Z"),
    };

    mockFindUnique.mockResolvedValue(sampleEntry);
    const { prisma } = await import("../prisma");
    vi.mocked(prisma.workType.findUnique).mockResolvedValue(sampleWorkType);
    mockUpdate.mockResolvedValue(updatedEntry);

    const response = await request(app).put("/api/entries/1").send({
      performedAt: "2025-05-24",
      workTypeId: 1,
      volume: 30,
      executorName: "Иванов Иван Иванович",
    });

    expect(response.status).toBe(200);
    expect(response.body.volume).toBe(30);
  });

  it("DELETE /api/entries/:id removes entry", async () => {
    mockFindUnique.mockResolvedValue(sampleEntry);
    mockDelete.mockResolvedValue(sampleEntry);

    const response = await request(app).delete("/api/entries/1");

    expect(response.status).toBe(204);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
