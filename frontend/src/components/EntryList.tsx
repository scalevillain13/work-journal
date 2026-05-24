import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { fetchEntries } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { EntryForm } from "@/components/EntryForm";
import type { EntryFilters, JournalEntry } from "@/types";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

export function EntryList() {
  const [filters, setFilters] = useState<EntryFilters>({
    sort: "date",
    order: "desc",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: entries = [], isLoading, isError, error } = useQuery({
    queryKey: ["entries", filters],
    queryFn: () => fetchEntries(filters),
  });

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }));
  };

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setFilters({ sort: "date", order: "desc" });
  };

  const toggleSort = () => {
    setFilters((prev) => ({
      ...prev,
      order: prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const openCreateForm = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const openEditForm = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const openDeleteDialog = (entry: JournalEntry) => {
    setDeletingEntry(entry);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Журнал работ</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Учёт выполненных работ на строительном объекте
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Добавить запись
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">Фильтр по дате</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">С даты</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">По дату</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilters}>Применить</Button>
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <p className="p-8 text-center text-[var(--color-muted-foreground)]">Загрузка...</p>
        ) : isError ? (
          <p className="p-8 text-center text-[var(--color-destructive)]">
            Ошибка загрузки: {(error as Error)?.message || "Неизвестная ошибка"}
          </p>
        ) : entries.length === 0 ? (
          <p className="p-8 text-center text-[var(--color-muted-foreground)]">
            Записей не найдено. Добавьте первую запись в журнал.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]"
                  >
                    Дата выполнения
                    {filters.order === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Вид работ</TableHead>
                <TableHead>Объём</TableHead>
                <TableHead>Исполнитель</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.performedAt)}</TableCell>
                  <TableCell>{entry.workType.name}</TableCell>
                  <TableCell>
                    {entry.volume} {entry.workType.unit}
                  </TableCell>
                  <TableCell>{entry.executorName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(entry)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
      />

      <DeleteConfirm
        entry={deletingEntry}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
