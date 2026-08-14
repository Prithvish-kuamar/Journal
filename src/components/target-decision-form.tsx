"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTargetDecision, type TargetDecisionResult } from "@/app/actions";

function SaveButton() { const { pending } = useFormStatus(); return <button disabled={pending}>{pending ? "Saving…" : "Save target decision"}</button>; }

export function TargetDecisionForm({ candidateId, currentLabel }: { candidateId: string; currentLabel: string }) {
  const initial: TargetDecisionResult = { success: false };
  const [state, action] = useActionState(saveTargetDecision, initial);
  const [decision, setDecision] = useState(currentLabel === "No target" ? "NO_TARGET" : "DEFINED");
  const [label, setLabel] = useState(currentLabel === "No target" ? "" : currentLabel);
  const [price, setPrice] = useState("");
  return <form action={action} className="grid three"><input type="hidden" name="candidateId" value={candidateId}/><label className="field">Decision<select name="targetDecision" value={decision} onChange={(event) => setDecision(event.target.value)}><option value="DEFINED">Defined target</option><option value="NO_TARGET">No target</option></select></label><label className="field">Target label<input name="targetLabel" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Daily Supply, PDH, liquidity" />{state.fieldErrors?.targetLabel && <small className="danger" role="alert">{state.fieldErrors.targetLabel}</small>}</label><label className="field">Target price<input name="targetPrice" value={price} onChange={(event) => setPrice(event.target.value)} type="number" step="any" />{state.fieldErrors?.targetPrice && <small className="danger" role="alert">{state.fieldErrors.targetPrice}</small>}</label>{state.formError && <p className="notice" role="alert">{state.formError}</p>}<SaveButton /></form>;
}
