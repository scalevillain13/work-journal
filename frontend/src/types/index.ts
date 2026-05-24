export interface WorkType {
  id: number;
  name: string;
  unit: string;
}

export interface JournalEntry {
  id: number;
  performedAt: string;
  workTypeId: number;
  volume: number;
  executorName: string;
  createdAt: string;
  updatedAt: string;
  workType: WorkType;
}

export interface EntryInput {
  performedAt: string;
  workTypeId: number;
  volume: number;
  executorName: string;
}

export interface ApiError {
  errors: Array<{ field: string; message: string }>;
}

export interface EntryFilters {
  dateFrom?: string;
  dateTo?: string;
  sort?: "date";
  order?: "asc" | "desc";
}
