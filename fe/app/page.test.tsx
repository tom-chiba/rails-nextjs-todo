import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import Home from "./page";
import type { Todo } from "./types";

let nextId = 1;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("./generated/api-client/todoAPIV1", () => ({
  useGetApiV1Me: vi.fn(),
  useGetApiV1Todos: vi.fn(),
  getGetApiV1TodosQueryKey: vi.fn(() => ["/api/v1/todos"]),
  postApiV1Todos: vi.fn(),
  patchApiV1TodosId: vi.fn(),
  deleteApiV1TodosId: vi.fn(),
  deleteApiV1TodosBulkDestroy: vi.fn(),
  deleteApiV1TodosTodoIdImage: vi.fn(),
  deleteApiV1AuthSignOut: vi.fn(),
  deleteApiV1AuthAccount: vi.fn(),
}));

import * as api from "./generated/api-client/todoAPIV1";

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

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  nextId = 1;
  (api.useGetApiV1Me as Mock).mockReturnValue({
    data: { id: 1, email_address: "test@example.com" },
    isLoading: false,
  });
  (api.useGetApiV1Todos as Mock).mockReturnValue({
    data: [],
    isLoading: false,
  });
  (api.postApiV1Todos as Mock).mockImplementation(
    async (input: { "todo[text]": string; image?: File }) => ({
      data: {
        id: nextId++,
        text: input["todo[text]"],
        completed: false,
        image_url: input.image ? "http://example.com/test.jpg" : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } satisfies Todo,
      status: 201,
    }),
  );
  (api.patchApiV1TodosId as Mock).mockImplementation(
    async (id: number, input: { todo: Record<string, unknown> }) => ({
      data: {
        id,
        text: "Read a book",
        completed: true,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input.todo,
      },
      status: 200,
    }),
  );
  (api.deleteApiV1TodosId as Mock).mockResolvedValue(undefined);
  (api.deleteApiV1TodosBulkDestroy as Mock).mockResolvedValue(undefined);
});

describe("Home", () => {
  it("見出しが表示される", async () => {
    await vi.dynamicImportSettled?.();
    renderWithQueryClient(<Home />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sumi");
  });

  it("空状態のメッセージが表示される", async () => {
    renderWithQueryClient(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Nothing here yet. Start writing."),
      ).toBeDefined();
    });
  });

  it("Todoを追加できる", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Buy milk");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(api.postApiV1Todos).toHaveBeenCalledWith({
        "todo[text]": "Buy milk",
      });
    });
  });

  it("画像付きTodoを追加できる", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText("New todo")).toBeDefined();
    });

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Todo with image");

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const fileInput = screen.getByLabelText("Select image file");
    await user.upload(fileInput, file);

    await user.click(screen.getByLabelText("Add todo"));

    await waitFor(() => {
      expect(api.postApiV1Todos).toHaveBeenCalledWith(
        expect.objectContaining({
          "todo[text]": "Todo with image",
          image: file,
        }),
      );
    });
  });

  it("Todoを完了にできる", async () => {
    (api.useGetApiV1Todos as Mock).mockReturnValue({
      data: [
        {
          id: 1,
          text: "Read a book",
          completed: false,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Read a book")).toBeDefined();
    });

    const checkbox = screen.getByLabelText('Mark "Read a book" as complete');
    await user.click(checkbox);

    await waitFor(() => {
      expect(api.patchApiV1TodosId).toHaveBeenCalledWith(1, {
        todo: { completed: true },
      });
    });
  });

  it("Todoを削除できる", async () => {
    (api.useGetApiV1Todos as Mock).mockReturnValue({
      data: [
        {
          id: 1,
          text: "Temporary task",
          completed: false,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Temporary task")).toBeDefined();
    });

    const deleteBtn = screen.getByLabelText('Delete "Temporary task"');
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(api.deleteApiV1TodosId).toHaveBeenCalledWith(1);
    });
  });

  describe("フィルター", () => {
    const mixedTodos = [
      {
        id: 1,
        text: "Active task",
        completed: false,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        text: "Done task",
        completed: true,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it("Active フィルターで未完了のTodoのみ表示される", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: mixedTodos,
        isLoading: false,
      });

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Active task")).toBeDefined();
        expect(screen.getByText("Done task")).toBeDefined();
      });

      await user.click(screen.getByRole("button", { name: "Active" }));

      await waitFor(() => {
        expect(screen.getByText("Active task")).toBeDefined();
        expect(screen.queryByText("Done task")).toBeNull();
      });
    });

    it("Done フィルターで完了済みのTodoのみ表示される", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: mixedTodos,
        isLoading: false,
      });

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Active task")).toBeDefined();
      });

      await user.click(screen.getByRole("button", { name: "Done" }));

      await waitFor(() => {
        expect(screen.queryByText("Active task")).toBeNull();
        expect(screen.getByText("Done task")).toBeDefined();
      });
    });

    it("All フィルターで全てのTodoが表示される", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: mixedTodos,
        isLoading: false,
      });

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      // まず Active に切り替え
      await waitFor(() => {
        expect(screen.getByText("Active task")).toBeDefined();
      });
      await user.click(screen.getByRole("button", { name: "Active" }));
      await waitFor(() => {
        expect(screen.queryByText("Done task")).toBeNull();
      });

      // All に戻す
      await user.click(screen.getByRole("button", { name: "All" }));
      await waitFor(() => {
        expect(screen.getByText("Active task")).toBeDefined();
        expect(screen.getByText("Done task")).toBeDefined();
      });
    });
  });

  describe("Clear done", () => {
    it("完了済みTodoを一括削除する", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: [
          {
            id: 1,
            text: "Active task",
            completed: false,
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            text: "Done task",
            completed: true,
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Clear done")).toBeDefined();
      });

      await user.click(screen.getByText("Clear done"));

      await waitFor(() => {
        expect(api.deleteApiV1TodosBulkDestroy).toHaveBeenCalledWith({
          ids: [2],
        });
      });
    });

    it("完了済みTodoがなければClear doneボタンが表示されない", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: [
          {
            id: 1,
            text: "Active only",
            completed: false,
            image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Active only")).toBeDefined();
      });

      expect(screen.queryByText("Clear done")).toBeNull();
    });
  });

  describe("エラー表示", () => {
    it("クエリエラー時に失敗メッセージが表示される", async () => {
      (api.useGetApiV1Todos as Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
      });

      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load todos.")).toBeDefined();
      });
    });
  });

  describe("Delete account", () => {
    it("確認OKでAPIが呼ばれる", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      (api.deleteApiV1AuthAccount as Mock).mockResolvedValue(undefined);

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Delete account")).toBeDefined();
      });

      await user.click(screen.getByText("Delete account"));

      await waitFor(() => {
        expect(api.deleteApiV1AuthAccount).toHaveBeenCalled();
      });
    });

    it("確認キャンセルでAPIは呼ばれない", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      (api.deleteApiV1AuthAccount as Mock).mockClear();

      const user = userEvent.setup();
      renderWithQueryClient(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Delete account")).toBeDefined();
      });

      await user.click(screen.getByText("Delete account"));

      expect(api.deleteApiV1AuthAccount).not.toHaveBeenCalled();
    });
  });

  it("空文字のTodoは追加されない", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<Home />);

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
