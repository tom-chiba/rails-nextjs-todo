import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customFetch, selectData } from "./api-client";

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
      headers: new Headers(),
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

  it("204 で { data: undefined } ラッパーを返却する", async () => {
    const headers = new Headers();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      headers,
    });

    const result = await customFetch("/api/v1/auth/sign_out", {
      method: "DELETE",
    });
    expect(result).toEqual({ data: undefined, status: 204, headers });
  });

  it("相対 URL にベース URL を付与する", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () => Promise.resolve([]),
    });

    await customFetch("/api/v1/todos", { method: "GET" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3000/api/v1/todos",
    );
  });

  it("200 で { data, status, headers } ラッパーを返す", async () => {
    const payload = [{ id: 1, text: "Test", completed: false }];
    const headers = new Headers({ "content-type": "application/json" });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers,
      json: () => Promise.resolve(payload),
    });

    const result = await customFetch("/api/v1/todos", { method: "GET" });
    expect(result).toEqual({ data: payload, status: 200, headers });
  });

  it("201 で { data, status, headers } ラッパーを返す", async () => {
    const payload = { id: 1, text: "New", completed: false };
    const headers = new Headers();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      headers,
      json: () => Promise.resolve(payload),
    });

    const result = await customFetch("/api/v1/todos", { method: "POST" });
    expect(result).toEqual({ data: payload, status: 201, headers });
  });

  it("204 で { data: undefined, status: 204, headers } ラッパーを返す", async () => {
    const headers = new Headers();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      headers,
    });

    const result = await customFetch("/api/v1/auth/sign_out", {
      method: "DELETE",
    });
    expect(result).toEqual({ data: undefined, status: 204, headers });
  });

  it("selectData がラッパーから data を取得できる", async () => {
    const todos = [{ id: 1, text: "Test", completed: false }];
    const headers = new Headers();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers,
      json: () => Promise.resolve(todos),
    });

    const result = await customFetch("/api/v1/todos", { method: "GET" });
    const data = selectData(result as { data: unknown; status: number });
    expect(data).toEqual(todos);
  });
});
