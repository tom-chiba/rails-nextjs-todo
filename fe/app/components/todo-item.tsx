"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Todo } from "../types";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteImage?: (id: number) => void;
  onEdit: (id: number, text: string) => void;
};

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onDeleteImage,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setEditText(todo.text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError("Todo text cannot be empty");
      skipBlurRef.current = false;
      return;
    }
    if (trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    }
    setIsEditing(false);
    setEditError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
    setEditError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    skipBlurRef.current = true;
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      skipBlurRef.current = true;
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (!skipBlurRef.current) handleCancel();
    skipBlurRef.current = false;
  };

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
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                setEditError(null);
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="ink-input w-full text-base"
              aria-label={`Edit todo: ${todo.text}`}
            />
            {editError && (
              <p role="alert" className="mt-1 text-xs text-accent-vermillion">
                {editError}
              </p>
            )}
          </form>
        ) : (
          <span
            className={`text-base leading-relaxed transition-colors duration-300 ${
              todo.completed ? "todo-done-text" : "text-ink-dark"
            }`}
          >
            {todo.text}
          </span>
        )}
        {todo.image_url && (
          <div className="mt-2 flex items-end gap-2">
            {/* biome-ignore lint/performance/noImgElement: external API URL requires native img */}
            <img
              src={todo.image_url}
              alt={`Attachment for "${todo.text}"`}
              className="h-20 w-20 rounded-md border border-ink-faint/30 object-cover"
            />
            {onDeleteImage && !isEditing && (
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
      {!isEditing && (
        <>
          <button
            type="button"
            onClick={handleEditStart}
            className="text-ink-faint opacity-0 transition-all hover:text-ink-medium group-hover:opacity-100 focus:opacity-100 mt-1"
            aria-label={`Edit "${todo.text}"`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
        </>
      )}
    </motion.li>
  );
}
