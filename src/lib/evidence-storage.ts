export const MAX_EVIDENCE_BYTES = 6 * 1024 * 1024;
export const SUPPORTED_EVIDENCE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function safeExtension(mimeType: string): "png" | "jpg" | "webp" | null {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return null;
}

export function sanitizeFilename(value: string) {
  return value.normalize("NFKC").replace(/[\\/\u0000-\u001f]/g, "_").replace(/[^\w.() -]/g, "_").replace(/\.{2,}/g, ".").slice(0, 180) || "evidence";
}

export function evidencePath(userId: string, evidenceId: string, extension: string) {
  return `owner/${userId}/evidence/${evidenceId}/${crypto.randomUUID()}.${extension}`;
}

export function isOwnerEvidencePath(path: string, userId: string, evidenceId: string) {
  return path.startsWith(`owner/${userId}/evidence/${evidenceId}/`) && !path.includes("..") && !path.includes("\\") && !path.includes("//");
}

export function signatureMatches(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export function validateEvidenceDeclaration(mimeType: string, byteSize: number) {
  if (!safeExtension(mimeType)) return "Unsupported image type. Use PNG, JPEG, or WebP.";
  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > MAX_EVIDENCE_BYTES) return "Image must be 6 MB or smaller.";
  return null;
}
