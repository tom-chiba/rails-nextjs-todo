import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { getApiV1TodosResponseSuccess } from "../generated/api-client/todoAPIV1";
import type { Todo } from "../types";
import { useTodosMutation } from "./use-todos-mutation";

vi.mock("../generated/api-client/todoAPIV1", () => ({
  getGetApiV1TodosQueryKey: () => ["/api/v1/todos"],
}));

const TODO_KEY = ["/api/v1/todos"];

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    text: "Test todo",
    completed: false,
    image_url: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeCacheData(todos: Todo[]): getApiV1TodosResponseSuccess {
  return { data: todos, status: 200 } as getApiV1TodosResponseSuccess;
}

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return QueryClientProvider({ client: queryClient, children });
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
});

describe("useTodosMutation", () => {
  it("onMutate で楽観的更新が適用される", async () => {
    const existing = [makeTodo({ id: 1, completed: false })];
    queryClient.setQueryData(TODO_KEY, makeCacheData(existing));

    const mutationFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useTodosMutation({
          mutationFn,
          updater: (id: number, todos) => todos.filter((t) => t.id !== id),
        }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => {
      const cache =
        queryClient.getQueryData<getApiV1TodosResponseSuccess>(TODO_KEY);
      expect(cache?.data).toEqual([]);
    });
  });

  it("onError でキャッシュが前のスナップショットにロールバックされる", async () => {
    const existing = [makeTodo({ id: 1, text: "Keep me" })];
    queryClient.setQueryData(TODO_KEY, makeCacheData(existing));

    const mutationFn = vi.fn().mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(
      () =>
        useTodosMutation({
          mutationFn,
          updater: (_id: number, todos) => todos.filter((t) => t.id !== 1),
        }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cache =
      queryClient.getQueryData<getApiV1TodosResponseSuccess>(TODO_KEY);
    expect(cache?.data).toEqual(existing);
  });

  it("onSettled で成功時にも invalidateQueries が呼ばれる", async () => {
    const existing = [makeTodo()];
    queryClient.setQueryData(TODO_KEY, makeCacheData(existing));

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const mutationFn = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useTodosMutation({
          mutationFn,
          updater: (_v: unknown, todos) => todos,
        }),
      { wrapper },
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: TODO_KEY,
      });
    });
  });

  it("onSettled でエラー時にも invalidateQueries が呼ばれる", async () => {
    const existing = [makeTodo()];
    queryClient.setQueryData(TODO_KEY, makeCacheData(existing));

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const mutationFn = vi.fn().mockRejectedValue(new Error("fail"));

    const { result } = renderHook(
      () =>
        useTodosMutation({
          mutationFn,
          updater: (_v: unknown, todos) => todos,
        }),
      { wrapper },
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TODO_KEY });
  });

  it("キャッシュが undefined の場合は更新をスキップする", async () => {
    // queryClient にデータを設定しない
    const mutationFn = vi.fn().mockResolvedValue(undefined);
    const updater = vi.fn();

    const { result } = renderHook(
      () =>
        useTodosMutation({
          mutationFn,
          updater,
        }),
      { wrapper },
    );

    result.current.mutate("test");

    await waitFor(() => {
      expect(mutationFn).toHaveBeenCalled();
    });

    expect(updater).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(TODO_KEY)).toBeUndefined();
  });
});
