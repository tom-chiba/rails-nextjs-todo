"use client";

import { motion } from "motion/react";
import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteImage?: (id: number) => void;
};

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onDeleteImage,
}: TodoItemProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
      className="group flex items-start gap-4 border-b border-ink-faint/30 py-4"
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox mt-1"
        aria-label={`Mark "${todo.text}" as ${todo.completed ? "incomplete" : "complete"}`}
      />
      <div className="flex-1 min-w-0">
        <span
          className={`text-base leading-relaxed transition-colors duration-300 ${
            todo.completed ? "todo-done-text" : "text-ink-dark"
          }`}
        >
          {todo.text}
        </span>
        {todo.image_url && (
          <div className="mt-2 flex items-end gap-2">
            {/* biome-ignore lint/performance/noImgElement: external API URL requires native img */}
            <img
              src={todo.image_url}
              alt={`Attachment for "${todo.text}"`}
              className="h-20 w-20 rounded-md border border-ink-faint/30 object-cover"
            />
            {onDeleteImage && (
              <button
                type="button"
                onClick={() => onDeleteImage(todo.id)}
                className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove image from "${todo.text}"`}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="text-ink-faint opacity-0 transition-all hover:text-accent-vermillion group-hover:opacity-100 focus:opacity-100 mt-1"
        aria-label={`Delete "${todo.text}"`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.li>
  );
}
