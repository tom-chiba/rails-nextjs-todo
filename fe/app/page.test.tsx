import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import Home from "./page";

let nextId = 1;

vi.mock("./api/todos", () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import * as todosApi from "./api/todos";

vi.mock("motion/react", () => ({
  motion: {
    li: ({
      children,
      className,
    }: React.ComponentProps<"li"> & Record<string, unknown>) => (
      <li className={className}>{children}</li>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// next/dynamic をテスト用に同期モックへ置換
vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<{ default: React.ComponentType }>,
    _opts?: Record<string, unknown>,
  ) => {
    let Resolved: React.ComponentType | null = null;
    loader().then((mod) => {
      Resolved = mod.default;
    });
    return function DynamicMock(props: Record<string, unknown>) {
      if (Resolved) return <Resolved {...props} />;
      return null;
    };
  },
}));

beforeEach(() => {
  nextId = 1;
  (todosApi.getTodos as Mock).mockResolvedValue([]);
  (todosApi.createTodo as Mock).mockImplementation(async (text: string) => ({
    id: nextId++,
    text,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  (todosApi.updateTodo as Mock).mockImplementation(
    async (id: number, attrs: Record<string, unknown>) => ({
      id,
      text: "Read a book",
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...attrs,
    }),
  );
  (todosApi.deleteTodo as Mock).mockResolvedValue(undefined);
});

describe("Home", () => {
  it("見出しが表示される", async () => {
    await vi.dynamicImportSettled?.();
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sumi");
  });

  it("空状態のメッセージが表示される", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Nothing here yet. Start writing."),
      ).toBeDefined();
    });
  });

  it("Todoを追加できる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Buy milk");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Buy milk")).toBeDefined();
    });
  });

  it("Todoを完了にできる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Read a book");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Read a book")).toBeDefined();
    });

    const checkbox = screen.getByLabelText('Mark "Read a book" as complete');
    await user.click(checkbox);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Mark "Read a book" as incomplete'),
      ).toBeDefined();
    });
  });

  it("Todoを削除できる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Temporary task");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Temporary task")).toBeDefined();
    });

    const deleteBtn = screen.getByLabelText('Delete "Temporary task"');
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Temporary task")).toBeNull();
    });
  });

  it("空文字のTodoは追加されない", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText("Nothing here yet. Start writing."),
      ).toBeDefined();
    });
  });
});
