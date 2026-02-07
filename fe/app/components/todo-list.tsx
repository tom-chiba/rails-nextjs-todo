"use client";

import { AnimatePresence } from "motion/react";
import type { Todo } from "../types";
import { TodoItem } from "./todo-item";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-0">
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 animate-fade-in">
      {/* rendering-animate-svg-wrapper: SVG を div で包みアニメーション */}
      <div className="mb-6 animate-brush-reveal">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
          className="text-ink-faint/40"
        >
          <path
            d="M40 8C22.3 8 8 22.3 8 40s14.3 32 32 32 32-14.3 32-32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-ink-light text-sm tracking-wide">
        Nothing here yet. Start writing.
      </p>
    </div>
  );
}
