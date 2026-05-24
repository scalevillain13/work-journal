import { z } from "zod";

export const entrySchema = z.object({
  performedAt: z
    .string({ required_error: "Дата выполнения обязательна" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
  workTypeId: z
    .number({ required_error: "Вид работ обязателен" })
    .int("ID вида работ должен быть целым числом")
    .positive("Выберите вид работ"),
  volume: z
    .number({ required_error: "Объём обязателен" })
    .positive("Объём должен быть больше 0"),
  executorName: z
    .string({ required_error: "ФИО исполнителя обязательно" })
    .min(2, "ФИО должно содержать минимум 2 символа")
    .max(200, "ФИО не должно превышать 200 символов"),
});

export type EntryInput = z.infer<typeof entrySchema>;

export const entryQuerySchema = z.object({
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sort: z.enum(["date"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type EntryQuery = z.infer<typeof entryQuerySchema>;

export function formatZodErrors(error: z.ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join(".") || "root",
    message: e.message,
  }));
}
