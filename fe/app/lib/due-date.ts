// 締切日 (ISO 8601 文字列) と datetime-local 入力値・表示文字列の相互変換ユーティリティ

/** ISO 文字列を <input type="datetime-local"> 用の "YYYY-MM-DDTHH:mm" (ローカル時刻) に変換 */
export function isoToInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** datetime-local の入力値を ISO 文字列に変換。空なら null */
export function inputValueToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const formatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** 締切日を人間向け表示文字列に整形 */
export function formatDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatter.format(date);
}

/** 未完了かつ締切日時を過ぎていれば true */
export function isOverdue(iso: string | null, completed: boolean): boolean {
  if (!iso || completed) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}
