import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";
import { storageAdmin, storageBucketName } from "@/lib/supabase/admin";
import { MAX_EVIDENCE_BYTES, evidencePath, safeExtension, validateEvidenceDeclaration } from "@/lib/evidence-storage";

export const dynamic = "force-dynamic";
const input = z.object({ associationType: z.enum(["setup", "trade", "review"]), associatedId: z.string().min(1), originalFilename: z.string().min(1).max(255), mimeType: z.string(), byteSize: z.number().int().positive(), label: z.string().max(120).optional(), capturedAt: z.string().datetime().optional() });

// Scoped by ownerId so a caller cannot reach another account's record.
async function parentExists(type: "setup" | "trade" | "review", id: string, ownerId: string) {
  if (type === "setup") return Boolean(await prisma.setupCandidate.findFirst({ where: { id, ownerId }, select: { id: true } }));
  if (type === "trade") return Boolean(await prisma.trade.findFirst({ where: { id, ownerId }, select: { id: true } }));
  return Boolean(await prisma.tradeReview.findFirst({ where: { id, trade: { ownerId } }, select: { id: true } }));
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (auth.status !== "ok") return new NextResponse("Unauthorized", { status: 401 });
  const ownerId = auth.user.id;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  const error = validateEvidenceDeclaration(parsed.data.mimeType, parsed.data.byteSize);
  if (error) return NextResponse.json({ error }, { status: parsed.data.byteSize > MAX_EVIDENCE_BYTES ? 413 : 415 });
  if (!(await parentExists(parsed.data.associationType, parsed.data.associatedId, ownerId))) return NextResponse.json({ error: "Associated journal record was not found." }, { status: 404 });
  const extension = safeExtension(parsed.data.mimeType)!;
  const evidenceId = crypto.randomUUID();
  const path = evidencePath(ownerId, evidenceId, extension);
  const { data, error: storageError } = await storageAdmin().storage.from(storageBucketName()).createSignedUploadUrl(path);
  if (storageError || !data) return NextResponse.json({ error: "Upload authorization is temporarily unavailable." }, { status: 503 });
  const bucket = storageBucketName();
  return NextResponse.json({ evidenceId, path, token: data.token, bucket, contentType: parsed.data.mimeType, maxBytes: MAX_EVIDENCE_BYTES, associationType: parsed.data.associationType, associatedId: parsed.data.associatedId, originalFilename: parsed.data.originalFilename, label: parsed.data.label ?? null, capturedAt: parsed.data.capturedAt ?? null });
}
