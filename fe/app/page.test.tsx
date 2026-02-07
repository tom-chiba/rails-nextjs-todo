import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

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
    // vitest は ESM を同期的にロード可能なので、実コンポーネントを直接返す
    let Resolved: React.ComponentType | null = null;
    loader().then((mod) => {
      Resolved = mod.default;
    });
    return function DynamicMock(props: Record<string, unknown>) {
      // microtask で解決済みなので Resolved は非 null
      if (Resolved) return <Resolved {...props} />;
      return null;
    };
  },
}));

describe("Home", () => {
  it("見出しが表示される", async () => {
    // dynamic mock の解決を待つ
    await vi.dynamicImportSettled?.();
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sumi");
  });

  it("空状態のメッセージが表示される", () => {
    render(<Home />);
    expect(screen.getByText("Nothing here yet. Start writing.")).toBeDefined();
  });

  it("Todoを追加できる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Buy milk");
    await user.keyboard("{Enter}");

    expect(screen.getByText("Buy milk")).toBeDefined();
  });

  it("Todoを完了にできる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Read a book");
    await user.keyboard("{Enter}");

    const checkbox = screen.getByLabelText('Mark "Read a book" as complete');
    await user.click(checkbox);

    expect(
      screen.getByLabelText('Mark "Read a book" as incomplete'),
    ).toBeDefined();
  });

  it("Todoを削除できる", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByLabelText("New todo");
    await user.type(input, "Temporary task");
    await user.keyboard("{Enter}");

    const deleteBtn = screen.getByLabelText('Delete "Temporary task"');
    await user.click(deleteBtn);

    expect(screen.queryByText("Temporary task")).toBeNull();
  });

  it("空文字のTodoは追加されない", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByLabelText("New todo");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(screen.getByText("Nothing here yet. Start writing.")).toBeDefined();
  });
});
