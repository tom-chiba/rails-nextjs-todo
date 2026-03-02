"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h2 className="mb-4 font-display text-2xl text-ink-black">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-ink-medium">{error.message}</p>
        <button type="button" onClick={reset} className="ink-button">
          Try again
        </button>
      </div>
    </div>
  );
}
