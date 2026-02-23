import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApiError, getMe } from "./auth";

const API_BASE = "http://localhost:3000/api/v1";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getMe", () => {
  it("returns user data on success", async () => {
    const mockUser = { id: 1, email_address: "user@example.com" };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUser),
    });

    const result = await getMe();

    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/me`, {
      credentials: "include",
    });
  });

  it("throws AuthApiError on 401", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Authentication required" }),
    });

    await expect(getMe()).rejects.toThrow(AuthApiError);
    await expect(getMe()).rejects.toMatchObject({
      status: 401,
      errors: ["Authentication required"],
    });
  });
});
