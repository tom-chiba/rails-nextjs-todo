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

/**
 * Orval が生成する union response 型から success variant の data 型を抽出する。
 * customFetch がエラー時に throw するため、select/onSuccess には常に success variant が渡される。
 */
export type SuccessData<T> = Extract<T, { status: 200 | 201 | 204 }> extends {
  data: infer D;
}
  ? D
  : never;

/**
 * Orval response から success data を取得する。
 * 散在する `as` キャストを一箇所に集約する。
 */
export function selectData<T extends { status: number; data: unknown }>(
  res: T,
): SuccessData<T> {
  return (res as { data: SuccessData<T> }).data;
}

export async function customFetch<TData>(
  url: string,
  options?: RequestInit,
): Promise<TData> {
  const fullUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${API_BASE}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });

  if (res.ok) {
    if (res.status === 204)
      return { data: undefined, status: 204, headers: res.headers } as TData;
    return {
      data: await res.json(),
      status: res.status,
      headers: res.headers,
    } as TData;
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (Array.isArray(body.errors)) {
    throw new ApiError(res.status, body.errors as string[]);
  }
  if (typeof body.error === "string") {
    throw new ApiError(res.status, [body.error]);
  }
  throw new ApiError(res.status, ["An unexpected error occurred"]);
}
