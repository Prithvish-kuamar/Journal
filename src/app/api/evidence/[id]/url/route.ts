import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";
import { storageAdmin, storageBucketName } from "@/lib/supabase/admin";
import { isOwnerEvidencePath } from "@/lib/evidence-storage";

export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.status !== "ok") return new NextResponse("Unauthorized", { status: 401 });
  const ownerId = auth.user.id;
  const { id } = await params; const evidence = await prisma.evidence.findUnique({ where: { id } });
  if (!evidence?.storagePath || !isOwnerEvidencePath(evidence.storagePath, ownerId, evidence.id)) return new NextResponse("Not found", { status: 404 });
  const bucket = evidence.storageBucket || storageBucketName();
  const { data, error } = await storageAdmin().storage.from(bucket).createSignedUrl(evidence.storagePath, 180);
  if (error || !data?.signedUrl) return new NextResponse("Evidence preview unavailable", { status: 503 });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
}
