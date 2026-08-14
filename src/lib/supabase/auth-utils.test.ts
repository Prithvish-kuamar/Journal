import { describe, expect, it } from "vitest";
import { normalizeEmail, safeReturnPath } from "./auth-utils";

describe("owner authentication utilities", () => {
  it("normalizes owner email comparison values", () => expect(normalizeEmail("  Owner@Example.com ")).toBe("owner@example.com"));
  it("accepts internal return paths", () => expect(safeReturnPath("/journal?tab=review")).toBe("/journal?tab=review"));
  it("rejects absolute and protocol-based return URLs", () => {
    expect(safeReturnPath("//evil.example")).toBe("/");
    expect(safeReturnPath("https://evil.example")).toBe("/");
  });
});
