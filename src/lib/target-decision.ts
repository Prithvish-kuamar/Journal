export type TargetRecord = { label: string };

export function hasTargetDecision(targets: TargetRecord[]) {
  return targets.length > 0;
}

export function targetDecisionError(targets: TargetRecord[]) {
  return hasTargetDecision(targets) ? null : "Add a target or select No target before recording this trade.";
}

export function validateTargetDecision(decision: "DEFINED" | "NO_TARGET", label: string, price?: number) {
  if (decision === "DEFINED" && !label.trim()) return { targetLabel: "Enter a target label." };
  if (decision === "DEFINED" && price !== undefined && price <= 0) return { targetPrice: "Target price must be positive." };
  return {};
}
