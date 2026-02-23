/**
 * クライアントサイドで参照可能な user_email Cookie の読み書き。
 * httpOnly な session_id Cookie とは別に、UI 表示用に保持する。
 */

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUserEmail(): string | null {
  if (typeof document === "undefined") return null;
  return getCookie("user_email");
}

export function setUserEmail(email: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API のブラウザサポートが不十分なため document.cookie を使用
  document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=31536000; samesite=lax`;
  notifyAuthChange();
}

export function clearUserEmail() {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API のブラウザサポートが不十分なため document.cookie を使用
  document.cookie = "user_email=; path=/; max-age=0";
  notifyAuthChange();
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event("auth-change"));
}
