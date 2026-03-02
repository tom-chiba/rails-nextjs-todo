import { useMutation, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./lib/api-client";
import { Providers } from "./providers";

// ReactQueryDevtools を無効化（テスト環境では不要）
vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));

let locationHref: string;

beforeEach(() => {
  locationHref = window.location.href;
  // window.location.href のセッターをモック
  Object.defineProperty(window, "location", {
    value: { ...window.location, href: locationHref },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    value: { ...window.location, href: locationHref },
    writable: true,
    configurable: true,
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

describe("Providers 401 handling", () => {
  it("クエリで 401 ApiError が発生すると /login にリダイレクトする", async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["test-401"],
          queryFn: () => {
            throw new ApiError(401, ["Unauthorized"]);
          },
          retry: false,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).toBe("/login");
  });

  it("クエリで 401 以外のエラーではリダイレクトしない", async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["test-500"],
          queryFn: () => {
            throw new ApiError(500, ["Server error"]);
          },
          retry: false,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).not.toBe("/login");
  });

  it("クエリで skipRedirectOn401 が設定されていればリダイレクトしない", async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["test-skip"],
          queryFn: () => {
            throw new ApiError(401, ["Unauthorized"]);
          },
          retry: false,
          meta: { skipRedirectOn401: true },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).not.toBe("/login");
  });

  it("ミューテーションで 401 ApiError が発生すると /login にリダイレクトする", async () => {
    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: () => {
            throw new ApiError(401, ["Unauthorized"]);
          },
        }),
      { wrapper },
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).toBe("/login");
  });

  it("ミューテーションで skipRedirectOn401 が設定されていればリダイレクトしない", async () => {
    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: () => {
            throw new ApiError(401, ["Unauthorized"]);
          },
          meta: { skipRedirectOn401: true },
        }),
      { wrapper },
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).not.toBe("/login");
  });

  it("通常の Error では ApiError ではないためリダイレクトしない", async () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["test-plain-error"],
          queryFn: () => {
            throw new Error("Network error");
          },
          retry: false,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(window.location.href).not.toBe("/login");
  });
});
