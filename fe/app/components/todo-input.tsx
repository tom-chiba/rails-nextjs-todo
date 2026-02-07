"use client";

import { type FormEvent, useRef } from "react";

type TodoInputProps = {
  onAdd: (text: string) => void;
};

export function TodoInput({ onAdd }: TodoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;
    onAdd(text);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-12">
      <div className="flex items-end gap-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What needs to be done?"
          className="ink-input w-full pb-3 text-lg font-medium text-ink-dark"
          aria-label="New todo"
        />
        <button
          type="submit"
          className="group relative flex-shrink-0 pb-3 text-ink-faint transition-colors hover:text-accent-vermillion"
          aria-label="Add todo"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-transform group-hover:scale-110"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
