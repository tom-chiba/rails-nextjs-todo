"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import * as todosApi from "./api/todos";
import { TodoInput } from "./components/todo-input";
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    todosApi
      .getTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const addTodo = useCallback(async (text: string) => {
    const todo = await todosApi.createTodo(text);
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const toggleTodo = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      const newCompleted = !target.completed;
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: newCompleted } : todo,
        ),
      );
      const updated = await todosApi.updateTodo(id, {
        completed: newCompleted,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [todos],
  );

  const deleteTodo = useCallback(async (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    await todosApi.deleteTodo(id);
  }, []);

  const clearCompleted = useCallback(async () => {
    const completedTodos = todos.filter((t) => t.completed);
    setTodos((prev) => prev.filter((todo) => !todo.completed));
    await Promise.all(completedTodos.map((t) => todosApi.deleteTodo(t.id)));
  }, [todos]);

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
          <h1 className="font-display text-5xl tracking-tight text-ink-black sm:text-6xl">
            Sumi
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-accent-vermillion/60 to-transparent animate-brush-reveal" />
            <span className="text-xs tracking-[0.3em] text-ink-faint uppercase">
              Todo
            </span>
          </div>
        </header>

        <main id="main-content">
          <TodoInput onAdd={addTodo} />

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
