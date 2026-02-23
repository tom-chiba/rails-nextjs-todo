import type {
  AuthInput,
  AuthResponse,
  MessageResponse,
  PasswordResetInput,
  PasswordResetRequestInput,
  RegistrationInput,
} from "../types";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/v1`;

export class AuthApiError extends Error {
  constructor(
    public status: number,
    public errors: string[],
  ) {
    super(errors.join(", "));
    this.name = "AuthApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  const body = await res.json().catch(() => ({}));
  if ("errors" in body && Array.isArray(body.errors)) {
    throw new AuthApiError(res.status, body.errors);
  }
  if ("error" in body) {
    throw new AuthApiError(res.status, [body.error]);
  }
  throw new AuthApiError(res.status, ["An unexpected error occurred"]);
}

export async function signUp(input: RegistrationInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/sign_up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<AuthResponse>(res);
}

export async function signIn(input: AuthInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/sign_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<AuthResponse>(res);
}

export async function signOut(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/sign_out`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<void>(res);
}

export async function requestPasswordReset(
  input: PasswordResetRequestInput,
): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/auth/passwords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<MessageResponse>(res);
}

export async function resetPassword(
  token: string,
  input: PasswordResetInput,
): Promise<MessageResponse> {
  const res = await fetch(
    `${API_BASE}/auth/passwords/${encodeURIComponent(token)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );
  return handleResponse<MessageResponse>(res);
}
