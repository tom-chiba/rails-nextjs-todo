"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApiError, signIn } from "../../api/auth";
import { FormErrors } from "../../components/form-errors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      await signIn({ email_address: email, password });
      router.push("/");
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

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 font-display text-2xl text-ink-black">Log in</h2>

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

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-ink-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ink-input w-full py-2 text-ink-dark"
          />
        </div>

        <button type="submit" disabled={submitting} className="ink-button">
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-ink-light">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-accent-vermillion hover:underline"
          >
            Sign up
          </Link>
        </p>
        <p>
          <Link
            href="/forgot-password"
            className="text-ink-medium hover:text-accent-vermillion"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
