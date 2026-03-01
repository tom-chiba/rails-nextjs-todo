"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormErrors } from "../../components/form-errors";
import { usePostApiV1AuthSignIn } from "../../generated/api-client/todoAPIV1";
import { ApiError } from "../../lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const signIn = usePostApiV1AuthSignIn({
    mutation: {
      meta: { skipRedirectOn401: true },
      onSuccess: () => router.push("/"),
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrors(err.errors);
        } else {
          setErrors(["An unexpected error occurred"]);
        }
      },
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    signIn.mutate({ data: { email_address: email, password } });
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

        <button
          type="submit"
          disabled={signIn.isPending}
          className="ink-button"
        >
          {signIn.isPending ? "Logging in..." : "Log in"}
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
