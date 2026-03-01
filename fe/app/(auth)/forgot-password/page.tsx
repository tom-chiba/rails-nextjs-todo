"use client";

import Link from "next/link";
import { useState } from "react";
import { FormErrors } from "../../components/form-errors";
import { postApiV1AuthPasswords } from "../../generated/api-client/todoAPIV1";
import { AuthApiError } from "../../lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await postApiV1AuthPasswords({ email_address: email });
      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="animate-fade-in text-center">
        <h2 className="mb-4 font-display text-2xl text-ink-black">
          Check your email
        </h2>
        <p className="mb-6 text-sm text-ink-medium">
          If an account exists for {email}, you&apos;ll receive a password reset
          link shortly.
        </p>
        <Link
          href="/login"
          className="text-sm text-accent-vermillion hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-2 font-display text-2xl text-ink-black">
        Reset password
      </h2>
      <p className="mb-6 text-sm text-ink-light">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <FormErrors errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-ink-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ink-input w-full py-2 text-ink-dark"
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={submitting} className="ink-button">
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-ink-medium hover:text-accent-vermillion"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
