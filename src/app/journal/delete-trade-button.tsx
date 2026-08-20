"use client";

import { deleteTrade } from "@/app/actions";

export function DeleteTradeButton({ tradeId, label }: { tradeId: string; label: string }) {
  return (
    <form action={deleteTrade} style={{ display: "inline" }}>
      <input type="hidden" name="tradeId" value={tradeId}/>
      <button
        type="submit"
        className="danger"
        title="Delete this logged trade"
        onClick={(e) => { if (!confirm(`Delete the ${label} trade?\n\nIts legs, review and evidence records go with it. The setup candidate returns to un-traded and its gates and grade unlock.`)) e.preventDefault(); }}
      >Delete trade</button>
    </form>
  );
}
