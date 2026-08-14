import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/supabase/server";
import { storageAdmin, storageBucketName } from "@/lib/supabase/admin";
import { MAX_EVIDENCE_BYTES, isOwnerEvidencePath, sanitizeFilename, signatureMatches, validateEvidenceDeclaration } from "@/lib/evidence-storage";

const input = z.object({ evidenceId: z.string().uuid(), path: z.string().min(1), associationType: z.enum(["setup", "trade", "review"]), associatedId: z.string().min(1), originalFilename: z.string().min(1).max(255), mimeType: z.string(), byteSize: z.number().int().positive(), label: z.string().max(120).nullable().optional(), capturedAt: z.string().datetime().nullable().optional() });

async function parentIds(type: "setup" | "trade" | "review", id: string) {
  if (type === "setup") return await prisma.setupCandidate.findUnique({ where: { id }, select: { id: true } }) ? { candidateId: id, tradeId: null } : null;
  if (type === "trade") return await prisma.trade.findUnique({ where: { id }, select: { id: true } }) ? { candidateId: null, tradeId: id } : null;
  const review = await prisma.tradeReview.findUnique({ where: { id }, select: { tradeId: true } });
  return review ? { candidateId: null, tradeId: review.tradeId } : null;
}

export async function POST(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.status !== "ok") return new NextResponse(owner.status === "unauthenticated" ? "Unauthorized" : "Forbidden", { status: owner.status === "unauthenticated" ? 401 : 403 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isOwnerEvidencePath(parsed.data.path, owner.user.id, parsed.data.evidenceId)) return NextResponse.json({ error: "Invalid evidence finalization request." }, { status: 400 });
  const declarationError = validateEvidenceDeclaration(parsed.data.mimeType, parsed.data.byteSize);
  if (declarationError) return NextResponse.json({ error: declarationError }, { status: parsed.data.byteSize > MAX_EVIDENCE_BYTES ? 413 : 415 });
  const parents = await parentIds(parsed.data.associationType, parsed.data.associatedId);
  if (!parents) return NextResponse.json({ error: "Associated journal record was not found." }, { status: 404 });
  const admin = storageAdmin(); const bucket = storageBucketName();
  const downloaded = await admin.storage.from(bucket).download(parsed.data.path);
  if (downloaded.error || !downloaded.data) return NextResponse.json({ error: "Uploaded evidence could not be verified." }, { status: 400 });
  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  const actualType = downloaded.data.type || parsed.data.mimeType;
  if (bytes.byteLength > MAX_EVIDENCE_BYTES || actualType !== parsed.data.mimeType || !signatureMatches(bytes, parsed.data.mimeType)) { await admin.storage.from(bucket).remove([parsed.data.path]); return NextResponse.json({ error: "The uploaded file did not pass image verification." }, { status: 415 }); }
  try {
    const evidence = await prisma.evidence.create({ data: { id: parsed.data.evidenceId, ...parents, filename: sanitizeFilename(parsed.data.originalFilename), originalFilename: sanitizeFilename(parsed.data.originalFilename), mimeType: parsed.data.mimeType, byteSize: bytes.byteLength, storageBucket: bucket, storagePath: parsed.data.path, label: parsed.data.label ?? null, capturedAt: parsed.data.capturedAt ? new Date(parsed.data.capturedAt) : null } });
    await prisma.auditEvent.create({ data: { entityType: "Evidence", entityId: evidence.id, action: "EVIDENCE_UPLOADED" } });
    return NextResponse.json({ evidence });
  } catch {
    await admin.storage.from(bucket).remove([parsed.data.path]);
    return NextResponse.json({ error: "Evidence could not be saved." }, { status: 500 });
  }
}
