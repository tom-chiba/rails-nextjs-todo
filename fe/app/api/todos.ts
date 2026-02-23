import type { Todo } from "../types";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/v1`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json();
  }
  if (res.status === 401) {
    // Client-only: Server Component から呼ばれた場合は redirect せずエラーのみ投げる
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }
  throw new Error(`API error: ${res.status}`);
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE}/todos`, {
    credentials: "include",
  });
  return handleResponse<Todo[]>(res);
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ todo: { text } }),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(
  id: number,
  attrs: Partial<Pick<Todo, "text" | "completed">>,
): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ todo: attrs }),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<void>(res);
}
