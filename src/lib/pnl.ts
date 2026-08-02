export type PnlMetadata = { tradingFormat: string; calculationSupported?: boolean | null; tickSize?: number | null; tickValue?: number | null; contractSize?: number | null; contractMultiplier?: number | null };

export function calculateNetPnl(input: { direction: string; entryPrice: number; exitPrice: number; quantity: number; fees?: number; commission?: number; swapFunding?: number; metadata: PnlMetadata }) {
  if (input.metadata.calculationSupported === false) return { available: false as const, missing: ["calculation-supported metadata"] };
  const sign = input.direction === "SHORT" ? -1 : 1;
  let gross: number | null = null;
  let formula = "";
  if (input.metadata.tradingFormat === "FUTURES" && input.metadata.tickSize && input.metadata.tickValue) {
    gross = ((input.exitPrice - input.entryPrice) / input.metadata.tickSize) * input.metadata.tickValue * input.quantity * sign;
    formula = "(exit − entry) ÷ tick size × tick value × contracts";
  } else if (input.metadata.contractSize) {
    gross = (input.exitPrice - input.entryPrice) * input.quantity * input.metadata.contractSize * sign;
    formula = "(exit − entry) × quantity × contract size";
  }
  if (gross === null) return { available: false as const, missing: input.metadata.tradingFormat === "FUTURES" ? ["tick size", "tick value"] : ["contract size"] };
  const fees = input.fees ?? 0; const commission = input.commission ?? 0; const swapFunding = input.swapFunding ?? 0;
  return { available: true as const, grossPnl: gross, netPnl: gross - fees - commission - swapFunding, formula, fees, commission, swapFunding };
}

export function tradeDurationSeconds(entry: Date, exit: Date) {
  const seconds = Math.floor((exit.getTime() - entry.getTime()) / 1000);
  if (seconds < 0) throw new Error("Exit timestamp cannot be before entry timestamp.");
  return seconds;
}

export function formatDuration(seconds?: number | null) {
  if (seconds == null) return "Unavailable";
  const days = Math.floor(seconds / 86400); const hours = Math.floor((seconds % 86400) / 3600); const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}d ${hours}h ${minutes}m` : hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
