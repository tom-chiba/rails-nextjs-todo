"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApiError, signUp } from "../../api/auth";
import { FormErrors } from "../../components/form-errors";
import { setUserEmail } from "../../lib/auth-cookie";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);

    if (password !== passwordConfirmation) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setSubmitting(true);

    try {
      const res = await signUp({
        email_address: email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setUserEmail(res.email_address);
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
      <h2 className="mb-6 font-display text-2xl text-ink-black">Sign up</h2>

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
            Password confirmation
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

        <button type="submit" disabled={submitting} className="ink-button">
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-light">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-vermillion hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
