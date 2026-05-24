import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./client";

describe("getApiErrorMessage", () => {
  it("returns joined API validation messages", () => {
    const message = getApiErrorMessage(
      {
        errors: [
          { field: "volume", message: "Объём должен быть больше 0" },
          { field: "executorName", message: "ФИО обязательно" },
        ],
      },
      "fallback"
    );

    expect(message).toBe("Объём должен быть больше 0, ФИО обязательно");
  });

  it("returns fallback for unknown errors", () => {
    expect(getApiErrorMessage(new Error("boom"), "Не удалось сохранить")).toBe(
      "Не удалось сохранить"
    );
  });
});
