"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { TodoInput } from "./components/todo-input";
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

  const { data: todosResponse, isLoading: loading } = useGetApiV1Todos();
  const todos = (todosResponse as { data: Todo[] } | undefined)?.data ?? [];

  async function addTodo(text: string) {
    const res = await postApiV1Todos({ todo: { text } });
    const newTodo = (res as { data: Todo }).data;
    queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
      const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
      return { ...old, data: [newTodo, ...prev] };
    });
  }

  async function toggleTodo(id: number) {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    const newCompleted = !target.completed;

    // Optimistic update
    queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
      const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
      return {
        ...old,
        data: prev.map((t) =>
          t.id === id ? { ...t, completed: newCompleted } : t,
        ),
      };
    });

    try {
      const res = await patchApiV1TodosId(id, {
        todo: { completed: newCompleted },
      });
      const updated = (res as { data: Todo }).data;
      queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
        const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
        return {
          ...old,
          data: prev.map((t) => (t.id === id ? updated : t)),
        };
      });
    } catch {
      // Rollback
      queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
        const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
        return {
          ...old,
          data: prev.map((t) =>
            t.id === id ? { ...t, completed: !newCompleted } : t,
          ),
        };
      });
    }
  }

  async function deleteTodo(id: number) {
    const snapshot = todos;

    // Optimistic update
    queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
      const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
      return { ...old, data: prev.filter((t) => t.id !== id) };
    });

    try {
      await deleteApiV1TodosId(id);
    } catch {
      // Rollback
      queryClient.setQueryData(todosQueryKey, () => ({
        ...todosResponse,
        data: snapshot,
      }));
    }
  }

  async function clearCompleted() {
    const completedTodos = todos.filter((t) => t.completed);
    const snapshot = todos;

    // Optimistic update
    queryClient.setQueryData(todosQueryKey, (old: typeof todosResponse) => {
      const prev = (old as { data: Todo[] } | undefined)?.data ?? [];
      return { ...old, data: prev.filter((t) => !t.completed) };
    });

    try {
      await Promise.all(completedTodos.map((t) => deleteApiV1TodosId(t.id)));
    } catch {
      // Rollback
      queryClient.setQueryData(todosQueryKey, () => ({
        ...todosResponse,
        data: snapshot,
      }));
    }
  }

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
          <TodoInput onAdd={addTodo} />

          <h2 className="sr-only">Todo list</h2>
          {loading ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <p className="text-ink-light text-sm tracking-wide">Loading...</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          )}
        </main>

        <TodoFooter
          todos={todos}
          filter={filter}
          onFilterChange={setFilter}
          onClearCompleted={clearCompleted}
        />
      </div>
    </div>
  );
}
