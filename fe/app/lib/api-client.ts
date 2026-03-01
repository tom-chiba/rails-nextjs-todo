const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public errors: string[],
  ) {
    super(errors.join(", "));
    this.name = "ApiError";
  }
}

export async function customFetch<TData>(
  url: string,
  options?: RequestInit,
): Promise<TData> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });

  if (res.ok) {
    if (res.status === 204) return undefined as TData;
    return res.json();
  }

  const body = await res.json().catch(() => ({}));
  if ("errors" in body && Array.isArray(body.errors)) {
    throw new ApiError(res.status, body.errors);
  }
  if ("error" in body) {
    throw new ApiError(res.status, [body.error]);
  }
  throw new ApiError(res.status, ["An unexpected error occurred"]);
}
