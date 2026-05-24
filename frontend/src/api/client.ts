import type {
  ApiError,
  EntryFilters,
  EntryInput,
  JournalEntry,
  WorkType,
} from "@/types";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data as ApiError;
  }

  return data as T;
}

export async function fetchWorkTypes(): Promise<WorkType[]> {
  const response = await fetch(`${API_BASE}/work-types`);
  return handleResponse<WorkType[]>(response);
}

export async function fetchEntries(filters: EntryFilters = {}): Promise<JournalEntry[]> {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  const query = params.toString();
  const url = query ? `${API_BASE}/entries?${query}` : `${API_BASE}/entries`;
  const response = await fetch(url);
  return handleResponse<JournalEntry[]>(response);
}

export async function fetchEntry(id: number): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE}/entries/${id}`);
  return handleResponse<JournalEntry>(response);
}

export async function createEntry(data: EntryInput): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<JournalEntry>(response);
}

export async function updateEntry(id: number, data: EntryInput): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE}/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<JournalEntry>(response);
}

export async function deleteEntry(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/entries/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "errors" in error) {
    const apiError = error as ApiError;
    if (apiError.errors.length > 0) {
      return apiError.errors.map((e) => e.message).join(", ");
    }
  }
  return fallback;
}
