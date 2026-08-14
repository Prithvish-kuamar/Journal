"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MAX_EVIDENCE_BYTES, SUPPORTED_EVIDENCE_TYPES } from "@/lib/evidence-storage";

type EvidenceItem = { id: string; filename: string; mimeType: string; byteSize: number | null; label: string | null };
const supabase = createClient();
const types = new Set<string>(SUPPORTED_EVIDENCE_TYPES);

export function EvidenceControls({ associationType, associatedId, initial }: { associationType: "setup" | "trade" | "review"; associatedId: string; initial: EvidenceItem[] }) {
  const [items, setItems] = useState(initial); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    if (!types.has(file.type)) { setStatus("Use PNG, JPEG or WebP images only."); return; }
    if (file.size > MAX_EVIDENCE_BYTES) { setStatus("Image must be 6 MB or smaller."); return; }
    setBusy(true); setStatus("Authorizing upload…");
    try {
      const request = await fetch("/api/evidence/upload-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ associationType, associatedId, originalFilename: file.name, mimeType: file.type, byteSize: file.size }) });
      const reservation = await request.json(); if (!request.ok) throw new Error(reservation.error || "Upload authorization failed.");
      setStatus("Uploading evidence…");
      const result = await supabase.storage.from(reservation.bucket).uploadToSignedUrl(reservation.path, reservation.token, file, { contentType: file.type, upsert: false });
      if (result.error) throw new Error("Upload failed.");
      const finalized = await fetch("/api/evidence/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...reservation, byteSize: file.size, mimeType: file.type }) });
      const saved = await finalized.json(); if (!finalized.ok) throw new Error(saved.error || "Evidence verification failed.");
      setItems((current) => [...current, saved.evidence]); setStatus("Evidence uploaded.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Evidence upload failed."); } finally { setBusy(false); }
  }
  async function remove(id: string) { if (!window.confirm("Delete this evidence?")) return; setBusy(true); setStatus("Deleting evidence…"); try { const response = await fetch(`/api/evidence/${id}`, { method: "DELETE" }); if (!response.ok) throw new Error("Evidence could not be deleted."); setItems((current) => current.filter((item) => item.id !== id)); setStatus("Evidence deleted."); } catch (error) { setStatus(error instanceof Error ? error.message : "Evidence could not be deleted."); } finally { setBusy(false); } }
  return <div className="evidence-controls"><label className="field">Add screenshot<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }}/><small className="muted">PNG, JPEG or WebP · maximum 6 MB</small></label>{status && <p className="notice" role="status">{status}</p>}{items.length > 0 && <div className="evidence-grid">{items.map((item) => <figure key={item.id}><img src={`/api/evidence/${item.id}/url`} alt={item.label || item.filename}/><figcaption><span>{item.filename}</span><button type="button" onClick={() => void remove(item.id)} disabled={busy}>Delete</button></figcaption></figure>)}</div>}</div>;
}
