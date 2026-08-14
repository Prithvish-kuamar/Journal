import styles from "./performance-dashboard.module.css";

export type PerfData = {
  tradeCount: number;
  winCount: number;
  lossCount: number;
  totalR: number;
  averageR: number | null;
  grossWins: number;
  grossLosses: number;
  avgWin: number | null;
  avgLoss: number | null;
  winRate: number | null;
  profitFactor: number | null;
  sharpeRatio: number | null;
  sortino: number | null;
  maxDrawdown: number;
  currentDrawdown: number;
  recoveryFactor: number | null;
  consistencyScore: number;
  cumulativeCurve: number[];
  tradeDates: string[];
  executionAccuracy: number | null;
};

const fmt = (v: number | null, decimals = 2, prefix = "") =>
  v == null ? "—" : `${prefix}${v >= 0 ? "+" : ""}${v.toFixed(decimals)}`;
const fmtR = (v: number | null) => fmt(v, 2, "") + (v != null ? "R" : "");
const fmtPct = (v: number | null) => v == null ? "—" : `${v.toFixed(1)}%`;
const fmtRatio = (v: number | null) => v == null ? "—" : v.toFixed(2);
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function RatingRow({ thresholds, value }: { thresholds: { label: string; min: string; max?: string }[]; value: number | null }) {
  const active = value == null ? -1 : thresholds.findLastIndex((t, i) => {
    const min = parseFloat(t.min);
    return value >= min || i === 0;
  });
  return (
    <div className={styles.ratingRow}>
      {thresholds.map((t, i) => (
        <div key={t.label} className={`${styles.ratingCell} ${i === active ? styles.ratingActive : ""}`}>
          <span>{t.label}</span>
          <small>{t.min}{t.max ? `–${t.max}` : "+"}</small>
        </div>
      ))}
    </div>
  );
}

function WinGauge({ winRate, winCount, lossCount }: { winRate: number | null; winCount: number; lossCount: number }) {
  const r = 70; const cx = 100; const cy = 88;
  const pct = winRate ?? 0;
  const angle = Math.PI * (1 - pct / 100);
  const ex = cx + r * Math.cos(angle);
  const ey = cy - r * Math.sin(angle);
  const tone = pct >= 55 ? styles.gaugeGreen : pct >= 45 ? styles.gaugeOrange : styles.gaugeRed;
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fillPath = pct <= 0 ? null : `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  return (
    <figure className={styles.gaugeWrap} aria-label={`Win rate: ${fmtPct(winRate)}`}>
      <svg viewBox="0 0 200 120" fill="none" className={styles.gaugeSvg}>
        <path d={bgPath} stroke="#1e2326" strokeWidth="14" strokeLinecap="round" />
        {fillPath && <path d={fillPath} stroke="currentColor" strokeWidth="14" strokeLinecap="round" className={tone} />}
        <text x={cx} y={cy - 6} textAnchor="middle" className={styles.gaugeValue}>{fmtPct(winRate)}</text>
        <text x={cx - r + 2} y={cy + 20} textAnchor="start" className={styles.gaugeLabel}>Wins: {winCount}</text>
        <text x={cx + r - 2} y={cy + 20} textAnchor="end" className={styles.gaugeLabel}>Losses: {lossCount}</text>
      </svg>
    </figure>
  );
}

function AreaChart({ values, dates, tone = "green" }: { values: number[]; dates?: string[]; tone?: "green" | "red" }) {
  if (values.length < 2) return <div className={styles.chartEmpty}>Insufficient data</div>;
  const min = Math.min(...values, 0); const max = Math.max(...values, 0.001);
  const range = max - min || 1;
  const w = 500; const h = 80; const pad = 4;
  const px = (i: number) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const py = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const pts = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const zerY = py(0).toFixed(1);
  const areaPath = `M ${px(0)} ${zerY} L ${px(0)} ${py(values[0])} L ${pts.split(" ").slice(0).join(" L ")} L ${px(values.length - 1)} ${zerY} Z`;
  // Only display ~5 date labels
  const labelStep = Math.max(1, Math.floor(values.length / 4));
  const dateLabels = dates ? values.map((_, i) => i % labelStep === 0 || i === values.length - 1 ? { i, label: dates[i] } : null).filter(Boolean) as { i: number; label: string }[] : [];
  return (
    <figure className={styles.areaChartWrap}>
      <svg viewBox={`0 0 ${w} ${h + 18}`} preserveAspectRatio="none" className={styles.areaChart}>
        <path d={`M ${pad} ${zerY} H ${w - pad}`} className={styles.zeroLine} />
        <path d={areaPath} className={tone === "green" ? styles.areaFill : styles.areaFillRed} />
        <polyline points={pts} className={tone === "green" ? styles.areaLine : styles.areaLineRed} />
        {dateLabels.map(({ i, label }) => (
          <text key={i} x={px(i)} y={h + 14} textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} className={styles.axisLabel}>{label}</text>
        ))}
      </svg>
    </figure>
  );
}

function PentagonRadar({ winRate, profitFactor, expectancy, recovery, consistency, score }: { winRate: number; profitFactor: number; expectancy: number; recovery: number; consistency: number; score: number }) {
  const cx = 100; const cy = 100; const r = 70;
  const axes = [winRate, profitFactor, expectancy, recovery, consistency];
  const labels = ["Win Rate", "Profit F.", "Expect.", "Recovery", "Consist."];
  const n = axes.length;
  const pts = (scale = 1) => axes.map((v, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const len = r * clamp(v) / 100 * scale;
    return [cx + len * Math.cos(a), cy + len * Math.sin(a)];
  });
  const outerPts = pts(1); const dataPts = pts(1).map((_, i) => pts(1)[i]);
  // data points scaled by actual values
  const dataScaled = axes.map((v, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const len = r * clamp(v) / 100;
    return [cx + len * Math.cos(a), cy + len * Math.sin(a)];
  });
  const fmt2 = (arr: number[][]) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  // Ring at 50%
  const ring = axes.map((_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + r * 0.5 * Math.cos(a), cy + r * 0.5 * Math.sin(a)];
  });
  return (
    <div className={styles.pentagonWrap}>
      <div className={styles.pentagonScore}><small>PERFORMANCE SCORE</small><b>{score}</b><span>/100</span></div>
      <svg viewBox="20 20 160 160" fill="none" className={styles.pentagonSvg}>
        {/* Grid rings */}
        <polygon points={fmt2(outerPts)} className={styles.pentOuter} />
        <polygon points={fmt2(ring)} className={styles.pentRing} />
        {/* Axis lines */}
        {outerPts.map(([x, y], i) => <line key={i} x1={cx} y1={cy} x2={x} y2={y} className={styles.pentAxis} />)}
        {/* Data polygon */}
        <polygon points={fmt2(dataScaled)} className={styles.pentData} />
        {/* Dots at data points */}
        {dataScaled.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" className={styles.pentDot} />)}
        {/* Labels */}
        {outerPts.map(([x, y], i) => {
          const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const lx = cx + (r + 18) * Math.cos(a);
          const ly = cy + (r + 18) * Math.sin(a);
          const anchor = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
          return <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} className={styles.pentLabel}>{labels[i]}</text>;
        })}
      </svg>
      <div className={styles.pentMetrics}>
        {labels.map((label, i) => (
          <div key={label} className={styles.pentRow}>
            <span>{label}</span>
            <div className={styles.pentBarTrack}><div className={styles.pentBarFill} style={{ width: `${axes[i]}%` }} /></div>
            <b>{Math.round(axes[i])}</b>
          </div>
        ))}
      </div>
      <div className={styles.perfScoreBar}>
        <div className={styles.ratingBarTrack}>
          <div className={styles.ratingBarGradient} />
          <div className={styles.ratingBarPin} style={{ left: `${score}%` }} />
        </div>
        <div className={styles.perfScoreTicks}>
          <span>0</span><b>{score}</b><span>100</span>
        </div>
      </div>
    </div>
  );
}

function RatingBar({ value, lo = 0, hi = 2, good = 1, label }: { value: number | null; lo?: number; hi?: number; good?: number; label: string }) {
  const pct = value == null ? 0 : clamp((value - lo) / (hi - lo) * 100);
  const isGood = value != null && value >= good;
  const rating = value == null ? "—" : value >= hi * 0.9 ? "Excellent" : value >= good ? "Good" : value >= good * 0.5 ? "Fair" : "Poor";
  return (
    <div className={styles.ratingBar}>
      <div className={styles.ratingBarTrack}>
        <div className={styles.ratingBarGradient} />
        <div className={styles.ratingBarPin} style={{ left: `${pct}%` }} />
      </div>
      <div className={styles.ratingBarLabels}><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span></div>
      <div className={styles.ratingBarValue}>
        <b className={isGood ? styles.success : styles.muted}>{fmtRatio(value)}</b>
        <span className={isGood ? styles.success : styles.muted}>{rating}</span>
      </div>
      <p className={styles.ratingNote}>{label}</p>
    </div>
  );
}

export function PerformanceDashboard({ data }: { data: PerfData }) {
  const { tradeCount, winCount, lossCount, totalR, averageR, grossWins, grossLosses, avgWin, avgLoss, winRate, profitFactor, sharpeRatio, sortino, maxDrawdown, currentDrawdown, recoveryFactor, consistencyScore, cumulativeCurve, tradeDates, executionAccuracy } = data;

  // Normalize metrics to 0-100 for pentagon
  const normWinRate = clamp(winRate ?? 0);
  const normPF = clamp((profitFactor ?? 0) / 3 * 100);
  const normExp = clamp(((averageR ?? 0) + 1) / 3 * 100);
  const normRecovery = clamp((recoveryFactor ?? 0) / 3 * 100);
  const normConsistency = clamp(consistencyScore);
  const perfScore = Math.round((normWinRate + normPF + normExp + normRecovery + normConsistency) / 5);

  const curvePositive = totalR >= 0;

  // From peak to trough for drawdown card
  const peakIdx = cumulativeCurve.reduce((mi, v, i) => v > cumulativeCurve[mi] ? i : mi, 0);
  const troughIdx = cumulativeCurve.reduce((mi, v, i) => v < cumulativeCurve[mi] ? i : mi, 0);
  const peakDate = tradeDates[peakIdx] ?? "—";
  const troughDate = tradeDates[troughIdx] ?? "—";

  return (
    <div className={styles.perfDash}>
      {/* Row 1 */}
      <div className={styles.row1}>
        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>CUMULATIVE P&amp;L</small>
            <b className={curvePositive ? styles.success : styles.danger}>{fmtR(totalR)}</b>
          </header>
          <AreaChart values={cumulativeCurve} dates={tradeDates} tone={curvePositive ? "green" : "red"} />
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>WIN RATE</small>
            <b className={winRate != null && winRate >= 50 ? styles.success : styles.danger}>{fmtPct(winRate)}</b>
          </header>
          <WinGauge winRate={winRate} winCount={winCount} lossCount={lossCount} />
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>SHARPE RATIO</small>
            <b>{fmtRatio(sharpeRatio)}</b>
          </header>
          <div className={styles.subStats}>
            <div><small>Avg R / Trade</small><span className={styles.success}>{fmtR(averageR)}</span></div>
            <div><small>Std Dev</small><span>{sharpeRatio != null && averageR != null ? Math.abs(averageR / sharpeRatio).toFixed(3) : "—"}</span></div>
          </div>
          <RatingRow value={sharpeRatio} thresholds={[
            { label: "Poor", min: "≤0.0", max: "1.0" },
            { label: "Fair", min: "1.0", max: "2.0" },
            { label: "Good", min: "2.0", max: "3.0" },
            { label: "Excellent", min: "3.0" },
          ]} />
        </section>
      </div>

      {/* Row 2 */}
      <div className={styles.row2}>
        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>SORTINO RATIO</small>
            <b>{fmtRatio(sortino)}</b>
          </header>
          <div className={styles.subStats}>
            <div><small>Avg R / Trade</small><span className={styles.success}>{fmtR(averageR)}</span></div>
            <div><small>Downside Risk</small><span>{sortino != null && averageR != null ? Math.abs(averageR / sortino).toFixed(3) : "—"}</span></div>
          </div>
          <RatingRow value={sortino} thresholds={[
            { label: "Poor", min: "≤0.0", max: "1.0" },
            { label: "Fair", min: "1.0", max: "2.0" },
            { label: "Good", min: "2.0", max: "3.0" },
            { label: "Excellent", min: "3.0" },
          ]} />
        </section>

        <section className={`${styles.card} ${styles.cardWide}`}>
          <PentagonRadar
            winRate={normWinRate}
            profitFactor={normPF}
            expectancy={normExp}
            recovery={normRecovery}
            consistency={normConsistency}
            score={perfScore}
          />
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>PROFIT FACTOR</small>
            <b>{fmtRatio(profitFactor)}</b>
          </header>
          <RatingBar value={profitFactor} lo={0} hi={3} good={1.5} label="Aim for 2.0+ by improving win/loss ratio" />
          <div className={styles.subStats} style={{ marginTop: 12 }}>
            <div><small>Gross Wins</small><span className={styles.success}>{fmtR(grossWins)}</span></div>
            <div><small>Gross Losses</small><span className={styles.danger}>-{fmtR(grossLosses)}</span></div>
          </div>
        </section>
      </div>

      {/* Row 3 */}
      <div className={styles.row3}>
        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>RECOVERY FACTOR</small>
            <b className={(recoveryFactor ?? 0) >= 1 ? styles.success : styles.danger}>{fmtRatio(recoveryFactor)}</b>
          </header>
          <div className={styles.statPair}>
            <div><small>Max Drawdown</small><b className={styles.danger}>{fmtR(maxDrawdown)}</b><span>0.00% of peak</span></div>
            <div><small>Breakeven Target</small><b>{fmtR(totalR)}</b><span>{totalR > 0 ? "Already profitable" : "Not yet reached"}</span></div>
          </div>
          <div className={styles.ratingValueRow}>
            <span>Recovery Factor</span>
            <b>{fmtRatio(recoveryFactor)}</b>
            <span className={(recoveryFactor ?? 0) >= 1 ? styles.success : styles.muted}>{(recoveryFactor ?? 0) >= 1 ? "Good" : "Developing"}</span>
          </div>
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>CURRENT DRAWDOWN</small>
            <b className={currentDrawdown < 0 ? styles.danger : styles.success}>{fmtR(currentDrawdown)}</b>
          </header>
          <div className={styles.ddGrid}>
            <div><small>FROM PEAK</small><b>{fmtR(Math.max(...cumulativeCurve, 0))}</b><span>{peakDate}</span></div>
            <div style={{ textAlign: "right" }}><small>TO TROUGH</small><b>{fmtR(currentDrawdown)}</b><span>{troughDate}</span></div>
          </div>
          <div className={styles.ddBar}><div className={styles.ddFill} style={{ width: `${Math.min(100, Math.abs(currentDrawdown / Math.max(Math.abs(maxDrawdown), 0.001)) * 100)}%` }} /></div>
          <p className={styles.ratingNote}>{currentDrawdown < 0 ? `Maximum drawdown ${fmtR(maxDrawdown)} over selected period` : "No drawdown in current selection"}</p>
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>CONSISTENCY</small>
            <b>{consistencyScore}<span className={styles.outOf}>/100</span></b>
          </header>
          <div className={styles.consistBar}>
            <div className={styles.consistGradient} />
            <div className={styles.consistPin} style={{ left: `${consistencyScore}%` }} />
          </div>
          <div className={styles.consistLabels}><span>Volatile</span><span>Consistent</span></div>
          <div className={styles.subStats} style={{ marginTop: 10 }}>
            <div><small>Win Rate</small><span>{fmtPct(winRate)}</span></div>
            <div><small>Avg R</small><span>{fmtR(averageR)}</span></div>
          </div>
          <div className={styles.streakGrid}>
            <div><small>Win Streaks</small></div><div><small>Loss Streaks</small></div>
            <div><span>{winCount > 0 ? `${Math.max(1, Math.floor(winCount / tradeCount * 4))} in a row` : "—"}</span></div>
            <div><span>{lossCount > 0 ? `${Math.max(1, Math.floor(lossCount / tradeCount * 4))} in a row` : "—"}</span></div>
          </div>
        </section>

        <section className={styles.card}>
          <header className={styles.cardHead}>
            <small>EXPECTANCY / TRADE</small>
            <b className={(averageR ?? 0) >= 0 ? styles.success : styles.danger}>{fmtR(averageR)}</b>
          </header>
          <div className={styles.ratingValueRow}><span>Rating</span><span className={styles.success}>{(averageR ?? 0) >= 0.5 ? "Good" : (averageR ?? 0) >= 0 ? "Fair" : "Poor"}</span></div>
          <p className={styles.cardSection}>Expectancy Breakdown</p>
          <div className={styles.subStats}>
            <div><small>Win Contribution</small><span className={styles.success}>{fmtR(avgWin)}</span></div>
            <div><small>Loss Contribution</small><span className={styles.danger}>{avgLoss != null ? `-${avgLoss.toFixed(2)}R` : "—"}</span></div>
          </div>
          <div className={styles.subStats} style={{ marginTop: 6 }}>
            <div><small>Win Rate</small><span>{fmtPct(winRate)}</span></div>
            <div><small>Loss Rate</small><span>{winRate != null ? fmtPct(100 - winRate) : "—"}</span></div>
            <div><small>Avg Win</small><span>{fmtR(avgWin)}</span></div>
            <div><small>Avg Loss</small><span>{avgLoss != null ? `-${avgLoss.toFixed(2)}R` : "—"}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
