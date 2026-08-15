"use client";

import { useRef, useState } from "react";
import styles from "./ledger-ui.module.css";

const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`;

const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  return pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cpx = (px + x) / 2;
    return `${d} C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, "");
};

export function MiniChart({ values, tone = "success", label }: { values: number[]; tone?: "success" | "danger" | "info"; label: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; val: number } | null>(null);
  const safe = values.length ? values : [0, 0];
  const min = Math.min(...safe); const max = Math.max(...safe); const range = max - min || 1;
  const W = 100; const H = 42; const pad = 2;
  const px = (i: number) => pad + (i / Math.max(safe.length - 1, 1)) * (W - pad * 2);
  const py = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2);
  const pts: [number, number][] = safe.map((v, i) => [px(i), py(v)]);
  const linePath = smooth(pts);
  const areaPath = linePath ? `${linePath} L${px(safe.length - 1)},${H - pad} L${px(0)},${H - pad} Z` : "";

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width * W;
    const idx = Math.min(safe.length - 1, Math.max(0, Math.round((relX - pad) / (W - pad * 2) * (safe.length - 1))));
    setHover({ x: px(idx), y: py(safe[idx]), val: safe[idx] });
  };

  const lineColor = tone === "danger" ? "#e05252" : tone === "info" ? "#528ce0" : "#48c878";
  const fillColor = tone === "danger" ? "rgba(224,82,82,0.08)" : tone === "info" ? "rgba(82,140,224,0.08)" : "rgba(72,200,120,0.08)";

  return (
    <figure className={styles.chart} aria-label={label}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H + 6}`} preserveAspectRatio="none" role="img"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ cursor: "crosshair" }}>
        <title>{label}</title>
        <path d={`M0 ${H - pad}H${W}`} className={styles.gridLine} />
        <path d={`M0 ${H / 2}H${W}`} className={styles.gridLine} />
        {areaPath && <path d={areaPath} fill={fillColor} stroke="none" />}
        {linePath && <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
        {hover && <>
          <line x1={hover.x} y1={pad} x2={hover.x} y2={H - pad} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <circle cx={hover.x} cy={hover.y} r="1.5" fill="white" vectorEffect="non-scaling-stroke" />
          <rect x={hover.x > 70 ? hover.x - 22 : hover.x + 2} y={Math.max(2, hover.y - 8)} width="20" height="7" rx="1" fill="#1a1d20" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
          <text x={hover.x > 70 ? hover.x - 12 : hover.x + 12} y={Math.max(7, hover.y - 3)} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="4" fontFamily="var(--mono)">{fmt(hover.val)}</text>
        </>}
      </svg>
      <figcaption>{values.length ? `${values.length} recorded trade${values.length === 1 ? "" : "s"}` : "No recorded trades"}</figcaption>
    </figure>
  );
}
