import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/supabase/server";

export async function guardPage() {
  const owner = await requireOwner();
  if (owner.status !== "ok") redirect("/login");
}
