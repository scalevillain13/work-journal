import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createEntry,
  fetchWorkTypes,
  getApiErrorMessage,
  updateEntry,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JournalEntry } from "@/types";

const entryFormSchema = z.object({
  performedAt: z.string().min(1, "Дата выполнения обязательна"),
  workTypeId: z.string().min(1, "Выберите вид работ"),
  volume: z.coerce.number().positive("Объём должен быть больше 0"),
  executorName: z
    .string()
    .min(2, "ФИО должно содержать минимум 2 символа")
    .max(200, "ФИО не должно превышать 200 символов"),
});

type EntryFormValues = z.infer<typeof entryFormSchema>;

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry | null;
}

export function EntryForm({ open, onOpenChange, entry }: EntryFormProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(entry);

  const { data: workTypes = [], isLoading: workTypesLoading } = useQuery({
    queryKey: ["work-types"],
    queryFn: fetchWorkTypes,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      performedAt: "",
      workTypeId: "",
      volume: 0,
      executorName: "",
    },
  });

  const workTypeId = watch("workTypeId");
  const selectedWorkType = workTypes.find((wt) => String(wt.id) === workTypeId);

  useEffect(() => {
    if (open) {
      if (entry) {
        reset({
          performedAt: entry.performedAt,
          workTypeId: String(entry.workTypeId),
          volume: entry.volume,
          executorName: entry.executorName,
        });
      } else {
        reset({
          performedAt: new Date().toISOString().slice(0, 10),
          workTypeId: "",
          volume: 0,
          executorName: "",
        });
      }
    }
  }, [open, entry, reset]);

  const mutation = useMutation({
    mutationFn: (values: EntryFormValues) => {
      const payload = {
        performedAt: values.performedAt,
        workTypeId: Number(values.workTypeId),
        volume: values.volume,
        executorName: values.executorName.trim(),
      };

      return isEdit && entry
        ? updateEntry(entry.id, payload)
        : createEntry(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "errors" in error) {
        const apiError = error as { errors: Array<{ field: string; message: string }> };
        for (const err of apiError.errors) {
          const field = err.field as keyof EntryFormValues;
          if (field in entryFormSchema.shape) {
            setError(field, { message: err.message });
          }
        }
      }
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать запись" : "Добавить запись"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Измените данные и сохраните запись в журнале."
              : "Заполните форму для добавления новой записи в журнал работ."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="performedAt">Дата выполнения *</Label>
            <Input id="performedAt" type="date" {...register("performedAt")} />
            {errors.performedAt && (
              <p className="text-sm text-[var(--color-destructive)]">{errors.performedAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Вид работ *</Label>
            <Select
              value={workTypeId}
              onValueChange={(value) => setValue("workTypeId", value, { shouldValidate: true })}
              disabled={workTypesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите вид работ" />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((wt) => (
                  <SelectItem key={wt.id} value={String(wt.id)}>
                    {wt.name} ({wt.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workTypeId && (
              <p className="text-sm text-[var(--color-destructive)]">{errors.workTypeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">
              Объём{selectedWorkType ? ` (${selectedWorkType.unit})` : ""} *
            </Label>
            <Input
              id="volume"
              type="number"
              step="0.01"
              min="0"
              {...register("volume")}
            />
            {errors.volume && (
              <p className="text-sm text-[var(--color-destructive)]">{errors.volume.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="executorName">ФИО исполнителя *</Label>
            <Input id="executorName" placeholder="Иванов Иван Иванович" {...register("executorName")} />
            {errors.executorName && (
              <p className="text-sm text-[var(--color-destructive)]">{errors.executorName.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-[var(--color-destructive)]">
              {getApiErrorMessage(mutation.error, "Не удалось сохранить запись")}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
