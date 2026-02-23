import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// window.location のモック
const locationMock = { href: "" };
vi.stubGlobal("location", locationMock);

// fetch のモック
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { createTodo, getTodos } from "./todos";

beforeEach(() => {
  locationMock.href = "";
  fetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("todos API", () => {
  describe("credentials: include", () => {
    it("getTodos は credentials: include を送信する", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
      await getTodos();
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        credentials: "include",
      });
    });

    it("createTodo は credentials: include を送信する", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 1,
            text: "test",
            completed: false,
            created_at: "",
            updated_at: "",
          }),
      });
      await createTodo("test");
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        credentials: "include",
      });
    });
  });

  describe("401 ハンドリング", () => {
    it("401 レスポンス時に /login へリダイレクトする", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Authentication required" }),
      });

      await expect(getTodos()).rejects.toThrow("Authentication required");
      expect(locationMock.href).toBe("/login");
    });

    it("401 以外のエラーではリダイレクトしない", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(getTodos()).rejects.toThrow("API error: 500");
      expect(locationMock.href).toBe("");
    });
  });
});
