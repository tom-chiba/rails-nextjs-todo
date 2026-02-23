import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

function createRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const url = new URL(pathname, "http://localhost:3001");
  const req = new NextRequest(url);
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

describe("middleware", () => {
  describe("未認証ユーザー", () => {
    it("保護対象パスから /login にリダイレクトされる", () => {
      const res = middleware(createRequest("/"));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
    });

    it("公開パス /login はそのまま通過する", () => {
      const res = middleware(createRequest("/login"));
      expect(res.headers.get("location")).toBeNull();
    });

    it("公開パス /register はそのまま通過する", () => {
      const res = middleware(createRequest("/register"));
      expect(res.headers.get("location")).toBeNull();
    });

    it("公開パス /forgot-password はそのまま通過する", () => {
      const res = middleware(createRequest("/forgot-password"));
      expect(res.headers.get("location")).toBeNull();
    });

    it("公開パス /reset-password はそのまま通過する", () => {
      const res = middleware(createRequest("/reset-password"));
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("認証済みユーザー", () => {
    const session = { session_id: "valid-session" };

    it("保護対象パス / はそのまま通過する", () => {
      const res = middleware(createRequest("/", session));
      expect(res.headers.get("location")).toBeNull();
    });

    it("公開パス /login から / にリダイレクトされる", () => {
      const res = middleware(createRequest("/login", session));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/");
    });

    it("公開パス /register から / にリダイレクトされる", () => {
      const res = middleware(createRequest("/register", session));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/");
    });
  });
});
