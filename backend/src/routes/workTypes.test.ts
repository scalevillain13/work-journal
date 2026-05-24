import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";

vi.mock("../prisma", () => ({
  prisma: {
    workType: {
      findMany: vi.fn().mockResolvedValue([
        { id: 1, name: "Кладка перегородок", unit: "м³" },
        { id: 2, name: "Монтаж опалубки", unit: "м²" },
      ]),
    },
  },
}));

describe("work types API", () => {
  it("GET /api/work-types returns sorted work types", async () => {
    const app = createApp();

    const response = await request(app).get("/api/work-types");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      id: 1,
      name: "Кладка перегородок",
      unit: "м³",
    });
  });
});

describe("health API", () => {
  it("GET /api/health returns ok", async () => {
    const app = createApp();

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
