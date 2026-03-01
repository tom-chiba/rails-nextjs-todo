"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { TodoInput } from "./components/todo-input";
import type { getApiV1TodosResponse } from "./generated/api-client/todoAPIV1";
import {
  deleteApiV1TodosId,
  getGetApiV1TodosQueryKey,
  patchApiV1TodosId,
  postApiV1Todos,
  useGetApiV1Todos,
} from "./generated/api-client/todoAPIV1";
import { useAuth } from "./hooks/use-auth";
import type { Todo } from "./types";

type FilterType = "all" | "active" | "completed";

// bundle-dynamic-imports: motion/react は重いため動的インポート
const TodoList = dynamic(
  () => import("./components/todo-list").then((m) => ({ default: m.TodoList })),
  { ssr: false },
);

const TodoFooter = dynamic(
  () =>
    import("./components/todo-footer").then((m) => ({
      default: m.TodoFooter,
    })),
  { ssr: false },
);

export default function Home() {
  const { email, loading: authLoading, signOut } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");
  const queryClient = useQueryClient();
  const todosQueryKey = getGetApiV1TodosQueryKey();

  const { data: todos = [], isLoading: loading } = useGetApiV1Todos({
    query: {
      select: (res) => (res as { data: Todo[] }).data,
    },
  });

  const addMutation = useMutation({
    mutationFn: (text: string) => postApiV1Todos({ todo: { text } }),
    onSuccess: (res) => {
      const newTodo = (res as { data: Todo }).data;
      queryClient.setQueryData(
        todosQueryKey,
        (old: getApiV1TodosResponse | undefined) => {
          const prev = old ? (old as { data: Todo[] }).data : [];
          return { ...old, data: [newTodo, ...prev] };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      patchApiV1TodosId(id, { todo: { completed } }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });
      const previous =
        queryClient.getQueryData<getApiV1TodosResponse>(todosQueryKey);
      queryClient.setQueryData(
        todosQueryKey,
        (old: getApiV1TodosResponse | undefined) => {
          const prev = old ? (old as { data: Todo[] }).data : [];
          return {
            ...old,
            data: prev.map((t) => (t.id === id ? { ...t, completed } : t)),
          };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todosQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteApiV1TodosId(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });
      const previous =
        queryClient.getQueryData<getApiV1TodosResponse>(todosQueryKey);
      queryClient.setQueryData(
        todosQueryKey,
        (old: getApiV1TodosResponse | undefined) => {
          const prev = old ? (old as { data: Todo[] }).data : [];
          return { ...old, data: prev.filter((t) => t.id !== id) };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todosQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const clearCompletedMutation = useMutation({
    mutationFn: (completedIds: number[]) =>
      Promise.all(completedIds.map((id) => deleteApiV1TodosId(id))),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });
      const previous =
        queryClient.getQueryData<getApiV1TodosResponse>(todosQueryKey);
      queryClient.setQueryData(
        todosQueryKey,
        (old: getApiV1TodosResponse | undefined) => {
          const prev = old ? (old as { data: Todo[] }).data : [];
          return { ...old, data: prev.filter((t) => !t.completed) };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todosQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  // rerender-derived-state-no-effect: レンダー中に導出
  const filteredTodos =
    filter === "active"
      ? todos.filter((t) => !t.completed)
      : filter === "completed"
        ? todos.filter((t) => t.completed)
        : todos;

  return (
    <div className="flex min-h-screen items-start justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-lg">
        <header className="mb-14 animate-ink-drop">
          <div className="flex items-start justify-between">
            <h1 className="font-display text-5xl tracking-tight text-ink-black sm:text-6xl">
              Sumi
            </h1>
            {!authLoading && email && (
              <nav
                aria-label="User menu"
                className="flex items-center gap-3 pt-2"
              >
                <span className="hidden text-xs text-ink-light sm:inline">
                  {email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion"
                >
                  Log out
                </button>
              </nav>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-accent-vermillion/60 to-transparent animate-brush-reveal" />
            <span className="text-xs tracking-[0.3em] text-ink-faint uppercase">
              Todo
            </span>
          </div>
        </header>

        <main id="main-content">
          <TodoInput onAdd={(text) => addMutation.mutate(text)} />

          <h2 className="sr-only">Todo list</h2>
          {loading ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <p className="text-ink-light text-sm tracking-wide">Loading...</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={(id) => {
                const target = todos.find((t) => t.id === id);
                if (target)
                  toggleMutation.mutate({
                    id,
                    completed: !target.completed,
                  });
              }}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          )}
        </main>

        <TodoFooter
          todos={todos}
          filter={filter}
          onFilterChange={setFilter}
          onClearCompleted={() =>
            clearCompletedMutation.mutate(
              todos.filter((t) => t.completed).map((t) => t.id),
            )
          }
        />
      </div>
    </div>
  );
}
