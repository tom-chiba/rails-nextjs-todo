"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthApiError, resetPassword } from "../../api/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="animate-fade-in text-center">
        <h2 className="mb-4 font-display text-2xl text-ink-black">
          Invalid link
        </h2>
        <p className="mb-6 text-sm text-ink-medium">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-accent-vermillion hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setErrors([]);
    setSubmitting(true);

    try {
      await resetPassword(token, {
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setErrors(err.errors);
      } else {
        setErrors(["An unexpected error occurred"]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <h2 className="mb-4 font-display text-2xl text-ink-black">
          Password reset
        </h2>
        <p className="mb-6 text-sm text-ink-medium">
          Your password has been successfully reset.
        </p>
        <Link
          href="/login"
          className="text-sm text-accent-vermillion hover:underline"
        >
          Log in with your new password
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 font-display text-2xl text-ink-black">
        Set new password
      </h2>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded bg-accent-vermillion/10 p-3 text-sm text-accent-vermillion"
        >
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-ink-medium"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ink-input w-full py-2 text-ink-dark"
          />
        </div>

        <div>
          <label
            htmlFor="password-confirmation"
            className="mb-1 block text-sm text-ink-medium"
          >
            Confirm new password
          </label>
          <input
            id="password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="ink-input w-full py-2 text-ink-dark"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-ink-black py-2.5 text-sm font-medium text-washi-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10 animate-fade-in">
          <p className="text-sm tracking-wide text-ink-light">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
