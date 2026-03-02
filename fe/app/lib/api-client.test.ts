import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customFetch } from "./api-client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  fetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("customFetch", () => {
  it("credentials: include を送信する", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });
    await customFetch("/api/v1/todos", { method: "GET" });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
    });
  });

  it("401 で AuthApiError を throw する (リダイレクトしない)", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Authentication required" }),
    });

    await expect(
      customFetch("/api/v1/todos", { method: "GET" }),
    ).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 401,
        errors: ["Authentication required"],
      }),
    );
  });

  it("errors 配列をパースする", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ errors: ["Name can't be blank"] }),
    });

    await expect(
      customFetch("/api/v1/todos", { method: "POST" }),
    ).rejects.toThrow(
      expect.objectContaining({
        name: "ApiError",
        status: 422,
        errors: ["Name can't be blank"],
      }),
    );
  });

  it("error 文字列をパースする", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal server error" }),
    });

    await expect(
      customFetch("/api/v1/todos", { method: "GET" }),
    ).rejects.toThrow(
      expect.objectContaining({
        errors: ["Internal server error"],
      }),
    );
  });

  it("204 で undefined を返却する", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await customFetch("/api/v1/auth/sign_out", {
      method: "DELETE",
    });
    expect(result).toBeUndefined();
  });

  it("相対 URL にベース URL を付与する", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await customFetch("/api/v1/todos", { method: "GET" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3000/api/v1/todos",
    );
  });
});
