"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { TodoInput } from "./components/todo-input";
import {
  deleteApiV1TodosBulkDestroy,
  deleteApiV1TodosId,
  patchApiV1TodosId,
  postApiV1Todos,
  useGetApiV1Todos,
} from "./generated/api-client/todoAPIV1";
import { useAuth } from "./hooks/use-auth";
import { useTodosMutation } from "./hooks/use-todos-mutation";
import { selectData } from "./lib/api-client";

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
  const { email, loading: authLoading, signOut, deleteAccount } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const {
    data: todos = [],
    isLoading: loading,
    isError,
  } = useGetApiV1Todos({
    query: {
      select: selectData,
    },
  });

  const addMutation = useTodosMutation({
    mutationFn: (text: string) => postApiV1Todos({ todo: { text } }),
    updater: (text, todos) => [
      {
        id: -Date.now(),
        text,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...todos,
    ],
  });

  const toggleMutation = useTodosMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      patchApiV1TodosId(id, { todo: { completed } }),
    updater: ({ id, completed }, todos) =>
      todos.map((t) => (t.id === id ? { ...t, completed } : t)),
  });

  const deleteMutation = useTodosMutation({
    mutationFn: (id: number) => deleteApiV1TodosId(id),
    updater: (id, todos) => todos.filter((t) => t.id !== id),
  });

  const clearCompletedMutation = useTodosMutation({
    mutationFn: (ids: number[]) => deleteApiV1TodosBulkDestroy({ ids }),
    updater: (_ids, todos) => todos.filter((t) => !t.completed),
  });

  const mutationError =
    addMutation.isError ||
    toggleMutation.isError ||
    deleteMutation.isError ||
    clearCompletedMutation.isError;

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
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure? This will permanently delete your account and all data.",
                      )
                    ) {
                      deleteAccount();
                    }
                  }}
                  className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion"
                >
                  Delete account
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

          {mutationError && (
            <p
              role="alert"
              className="mt-3 text-center text-sm text-accent-vermillion animate-fade-in"
            >
              Something went wrong. Please try again.
            </p>
          )}

          <h2 className="sr-only">Todo list</h2>
          {loading ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <p className="text-ink-light text-sm tracking-wide">Loading...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <p className="text-ink-medium text-sm tracking-wide">
                Failed to load todos.
              </p>
            </div>
          ) : (
            <>
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
              <TodoFooter
                todos={todos}
                filter={filter}
                onFilterChange={setFilter}
                onClearCompleted={() => {
                  const ids = todos.filter((t) => t.completed).map((t) => t.id);
                  if (ids.length > 0) clearCompletedMutation.mutate(ids);
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
