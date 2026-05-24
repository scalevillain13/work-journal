import { describe, expect, it } from "vitest";
import { entryQuerySchema, entrySchema } from "./entry";

describe("entrySchema", () => {
  it("accepts valid entry payload", () => {
    const result = entrySchema.safeParse({
      performedAt: "2025-05-24",
      workTypeId: 1,
      volume: 24,
      executorName: "Иванов Иван Иванович",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = entrySchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.errors.map((e) => e.path[0]);
      expect(fields).toContain("performedAt");
      expect(fields).toContain("workTypeId");
      expect(fields).toContain("volume");
      expect(fields).toContain("executorName");
    }
  });

  it("rejects invalid date format", () => {
    const result = entrySchema.safeParse({
      performedAt: "24.05.2025",
      workTypeId: 1,
      volume: 10,
      executorName: "Иванов И.И.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-positive volume", () => {
    const result = entrySchema.safeParse({
      performedAt: "2025-05-24",
      workTypeId: 1,
      volume: 0,
      executorName: "Иванов И.И.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects too short executor name", () => {
    const result = entrySchema.safeParse({
      performedAt: "2025-05-24",
      workTypeId: 1,
      volume: 10,
      executorName: "И",
    });

    expect(result.success).toBe(false);
  });
});

describe("entryQuerySchema", () => {
  it("applies defaults for sort and order", () => {
    const result = entryQuerySchema.parse({});

    expect(result).toEqual({
      sort: "date",
      order: "desc",
    });
  });

  it("accepts date range filters", () => {
    const result = entryQuerySchema.parse({
      dateFrom: "2025-05-01",
      dateTo: "2025-05-31",
      order: "asc",
    });

    expect(result.dateFrom).toBe("2025-05-01");
    expect(result.dateTo).toBe("2025-05-31");
    expect(result.order).toBe("asc");
  });
});
