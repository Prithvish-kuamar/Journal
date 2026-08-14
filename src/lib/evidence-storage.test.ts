import { describe, expect, it } from "vitest";
import { evidencePath, isOwnerEvidencePath, safeExtension, sanitizeFilename, signatureMatches, validateEvidenceDeclaration } from "./evidence-storage";

describe("private evidence storage validation", () => {
  it("maps supported types and rejects unsupported types", () => { expect(safeExtension("image/png")).toBe("png"); expect(safeExtension("image/svg+xml")).toBeNull(); });
  it("enforces the six MB limit", () => { expect(validateEvidenceDeclaration("image/png", 6 * 1024 * 1024)).toBeNull(); expect(validateEvidenceDeclaration("image/png", 6 * 1024 * 1024 + 1)).toBeTruthy(); });
  it("sanitizes filenames and generates owner-scoped paths", () => { expect(sanitizeFilename("../secret\\shot.png")).not.toContain("/"); const path = evidencePath("user", "ev", "png"); expect(isOwnerEvidencePath(path, "user", "ev")).toBe(true); expect(isOwnerEvidencePath(path, "other", "ev")).toBe(false); });
  it("checks PNG, JPEG and WebP signatures", () => { expect(signatureMatches(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), "image/png")).toBe(true); expect(signatureMatches(Uint8Array.from([0xff,0xd8,0xff]), "image/jpeg")).toBe(true); expect(signatureMatches(Uint8Array.from([82,73,70,70,0,0,0,0,87,69,66,80]), "image/webp")).toBe(true); });
});
