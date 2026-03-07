"use client";

import { type FormEvent, useRef, useState } from "react";

type TodoInputProps = {
  onAdd: (text: string, image?: File) => void;
};

const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function TodoInput({ onAdd }: TodoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;
    onAdd(text, selectedFile ?? undefined);
    if (inputRef.current) inputRef.current.value = "";
    clearImage();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Add new todo"
      className="relative mb-12"
    >
      <div className="flex items-end gap-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What needs to be done?"
          className="ink-input w-full pb-3 text-lg font-medium text-ink-dark"
          aria-label="New todo"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex-shrink-0 pb-3 text-ink-faint transition-colors hover:text-accent-vermillion"
          aria-label="Attach image"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-transform group-hover:scale-110"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path
              d="M21 15l-5-5L5 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select image file"
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

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-vermillion">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-3 flex items-center gap-3">
          {/* biome-ignore lint/performance/noImgElement: blob URL requires native img */}
          <img
            src={preview}
            alt="Selected attachment preview"
            className="h-16 w-16 rounded-md border border-ink-faint/30 object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion"
            aria-label="Remove selected image"
          >
            Remove
          </button>
        </div>
      )}
    </form>
  );
}
