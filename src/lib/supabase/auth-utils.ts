export const normalizeEmail = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

export function safeReturnPath(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("://") ? value : "/";
}
