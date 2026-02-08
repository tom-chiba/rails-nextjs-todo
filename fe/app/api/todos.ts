import type { Todo } from "../types";

const API_BASE = "http://localhost:3000/api/v1";

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE}/todos`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todo: { text } }),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(
  id: number,
  attrs: Partial<Pick<Todo, "text" | "completed">>,
): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todo: attrs }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
}
