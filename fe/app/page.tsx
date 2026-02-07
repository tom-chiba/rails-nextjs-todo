"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
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

  // rerender-functional-setstate: 関数型 setState で安定したコールバック
  const addTodo = (text: string) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    setTodos((prev) => [{ id, text, completed: false, createdAt }, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // rerender-derived-state-no-effect: レンダー中に導出
  const filteredTodos =
    filter === "active"
      ? todos.filter((t) => !t.completed)
      : filter === "completed"
        ? todos.filter((t) => t.completed)
        : todos;

  return (
    <div className="flex min-h-screen items-start justify-center px-6 py-16 sm:py-24">
      <main className="w-full max-w-lg">
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

        <TodoInput onAdd={addTodo} />

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />

        <TodoFooter
          todos={todos}
          filter={filter}
          onFilterChange={setFilter}
          onClearCompleted={clearCompleted}
        />
      </main>
    </div>
  );
}
