"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  formatDueDate,
  inputValueToIso,
  isOverdue,
  isoToInputValue,
} from "../lib/due-date";
import type { Todo } from "../types";
import { ImageLightbox } from "./image-lightbox";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteImage?: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  onEditDueDate: (id: number, dueDate: string | null) => void;
};

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onDeleteImage,
  onEdit,
  onEditDueDate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const skipBlurRef = useRef(false);
  const wasEditingRef = useRef(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailButtonRef = useRef<HTMLButtonElement>(null);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDateValue, setDueDateValue] = useState("");
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const overdue = isOverdue(todo.due_date, todo.completed);

  useEffect(() => {
    if (isEditingDueDate) dueDateInputRef.current?.focus();
  }, [isEditingDueDate]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      wasEditingRef.current = true;
    } else if (wasEditingRef.current) {
      editButtonRef.current?.focus();
      wasEditingRef.current = false;
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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleDueDateEditStart = () => {
    setDueDateValue(isoToInputValue(todo.due_date));
    setIsEditingDueDate(true);
  };

  const handleDueDateSave = () => {
    onEditDueDate(todo.id, inputValueToIso(dueDateValue));
    setIsEditingDueDate(false);
  };

  const handleDueDateClear = () => {
    onEditDueDate(todo.id, null);
    setIsEditingDueDate(false);
  };

  const handleDueDateSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleDueDateSave();
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
              aria-describedby={editError ? `edit-error-${todo.id}` : undefined}
            />
            {editError && (
              <p
                id={`edit-error-${todo.id}`}
                role="alert"
                className="mt-1 text-xs text-accent-vermillion"
              >
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
        <div className="mt-1.5 flex items-center gap-2">
          {isEditingDueDate ? (
            <form
              onSubmit={handleDueDateSubmit}
              className="flex items-center gap-2"
            >
              <input
                ref={dueDateInputRef}
                type="datetime-local"
                value={dueDateValue}
                onChange={(e) => setDueDateValue(e.target.value)}
                className="ink-input text-xs text-ink-medium"
                aria-label={`Due date for "${todo.text}"`}
              />
              <button
                type="submit"
                className="text-xs text-ink-faint transition-colors hover:text-ink-medium"
              >
                Save
              </button>
              {todo.due_date && (
                <button
                  type="button"
                  onClick={handleDueDateClear}
                  className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditingDueDate(false)}
                className="text-xs text-ink-faint transition-colors hover:text-ink-medium"
              >
                Cancel
              </button>
            </form>
          ) : todo.due_date ? (
            <button
              type="button"
              onClick={handleDueDateEditStart}
              className={`inline-flex items-center gap-1 rounded text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-vermillion ${
                overdue
                  ? "text-accent-vermillion"
                  : "text-ink-light hover:text-ink-medium"
              }`}
              aria-label={`Due ${formatDueDate(todo.due_date)}${overdue ? " (overdue)" : ""}. Edit due date.`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="11"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M2 6h12M5.5 1.5v3M10.5 1.5v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>{formatDueDate(todo.due_date)}</span>
              {overdue && (
                <span className="font-medium tracking-wide uppercase">
                  Overdue
                </span>
              )}
            </button>
          ) : (
            !isEditing && (
              <button
                type="button"
                onClick={handleDueDateEditStart}
                className="text-xs text-ink-faint opacity-0 transition-all hover:text-ink-medium group-hover:opacity-100 focus:opacity-100"
                aria-label={`Set due date for "${todo.text}"`}
              >
                Set due date
              </button>
            )
          )}
        </div>
        {todo.image_url && (
          <div className="mt-2 flex items-end gap-2">
            <button
              ref={thumbnailButtonRef}
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="cursor-zoom-in rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-vermillion"
              aria-label={`View full image for "${todo.text}"`}
            >
              {/* biome-ignore lint/performance/noImgElement: external API URL requires native img */}
              <img
                src={todo.image_url}
                alt=""
                aria-hidden="true"
                className="h-20 w-20 rounded-md border border-ink-faint/30 object-cover transition-opacity hover:opacity-80"
              />
            </button>
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
        <AnimatePresence>
          {lightboxOpen && todo.image_url && (
            <ImageLightbox
              src={todo.image_url}
              alt={`Attachment for "${todo.text}"`}
              onClose={() => setLightboxOpen(false)}
              triggerRef={thumbnailButtonRef}
            />
          )}
        </AnimatePresence>
      </div>
      {!isEditing && (
        <>
          <button
            ref={editButtonRef}
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
