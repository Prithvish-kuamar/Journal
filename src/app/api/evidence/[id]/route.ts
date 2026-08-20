import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";
import { storageAdmin, storageBucketName } from "@/lib/supabase/admin";
import { isOwnerEvidencePath } from "@/lib/evidence-storage";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.status !== "ok") return new NextResponse("Unauthorized", { status: 401 });
  const ownerId = auth.user.id;
  const { id } = await params; const evidence = await prisma.evidence.findUnique({ where: { id } });
  if (!evidence?.storagePath || !isOwnerEvidencePath(evidence.storagePath, ownerId, evidence.id)) return new NextResponse("Not found", { status: 404 });
  const bucket = evidence.storageBucket || storageBucketName(); const removed = await storageAdmin().storage.from(bucket).remove([evidence.storagePath]);
  if (removed.error && !/not found|no such/i.test(removed.error.message)) return NextResponse.json({ error: "Evidence storage is temporarily unavailable." }, { status: 503 });
  await prisma.evidence.delete({ where: { id: evidence.id } });
  await prisma.auditEvent.create({ data: { ownerId, entityType: "Evidence", entityId: evidence.id, action: "EVIDENCE_DELETED" } });
  return NextResponse.json({ deleted: true });
}
