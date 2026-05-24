import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntryForm } from "./EntryForm";

function renderForm(open = true) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EntryForm open={open} onOpenChange={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("EntryForm", () => {
  it("renders required fields in create mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, name: "Кладка перегородок", unit: "м³" }],
      })
    );

    renderForm();

    expect(screen.getByText("Добавить запись")).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата выполнения/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ФИО исполнителя/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Добавить" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Кладка перегородок (м³)")).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("shows validation errors for empty submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, name: "Кладка перегородок", unit: "м³" }],
      })
    );

    const user = userEvent.setup();
    renderForm();

    const dialog = screen.getByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(dialog).toHaveTextContent("Выберите вид работ");
    expect(dialog).toHaveTextContent("Объём должен быть больше 0");
    expect(dialog).toHaveTextContent("ФИО должно содержать минимум 2 символа");

    vi.unstubAllGlobals();
  });
});
