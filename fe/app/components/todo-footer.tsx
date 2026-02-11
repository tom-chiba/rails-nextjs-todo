"use client";

import type { Todo } from "../types";

type FilterType = "all" | "active" | "completed";

type TodoFooterProps = {
  todos: Todo[];
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
};

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

export function TodoFooter({
  todos,
  filter,
  onFilterChange,
  onClearCompleted,
}: TodoFooterProps) {
  if (todos.length === 0) return null;

  // js-combine-iterations: 1回のループで activeCount と hasCompleted を導出
  let activeCount = 0;
  let hasCompleted = false;
  for (const t of todos) {
    if (t.completed) {
      hasCompleted = true;
    } else {
      activeCount++;
    }
  }

  return (
    <footer className="mt-8 flex items-center justify-between border-t border-ink-faint/20 pt-6">
      <p role="status" aria-live="polite" className="text-sm text-ink-medium tabular-nums">
        <span className="font-medium text-ink-medium">{activeCount}</span>{" "}
        {activeCount === 1 ? "item" : "items"} remaining
      </p>

      <nav className="flex gap-1" aria-label="Filter todos">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`rounded-full px-3 py-1 text-xs tracking-wide transition-all ${
              filter === f.value
                ? "bg-ink-black text-washi-cream"
                : "text-ink-light hover:text-ink-dark"
            }`}
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* rendering-conditional-render: boolean なので安全だが明示的に */}
      {hasCompleted ? (
        <button
          type="button"
          onClick={onClearCompleted}
          className="text-xs text-ink-faint transition-colors hover:text-accent-vermillion"
        >
          Clear done
        </button>
      ) : null}
    </footer>
  );
}
