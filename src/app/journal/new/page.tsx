import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { createCandidate } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { ENTRY_TIMEFRAMES, JOURNAL_OPTION_LIBRARY } from "@/lib/journal-options";
import { ENTRY_MODEL_SHELLS, EXECUTION_INSTRUMENTS, SESSION_LABELS } from "@/lib/strategy-defaults";
import { guardPage } from "@/lib/supabase/page-guard";

export const dynamic = "force-dynamic";

export default async function NewSetupPage() {
  await guardPage();
  const [strategy, plans] = await Promise.all([prisma.strategyVersion.findFirst({ where: { status: "PUBLISHED" }, orderBy: { versionNumber: "desc" }, include: { entryModels: { where: { active: true }, orderBy: { code: "asc" } } } }), prisma.dailyPlan.findMany({ where: { status: "ACTIVE" }, orderBy: { planDate: "desc" } })]);
  let journalOptions = strategy ? await prisma.journalOption.findMany({ where: { strategyVersionId: strategy.id, active: true, archivedAt: null }, orderBy: { displayOrder: "asc" } }) : [];
  if (strategy && journalOptions.length === 0) {
    await prisma.journalOption.createMany({ data: JOURNAL_OPTION_LIBRARY.map((option, index) => ({ strategyVersionId: strategy.id, ...option, displayOrder: index + 1 })) });
    journalOptions = await prisma.journalOption.findMany({ where: { strategyVersionId: strategy.id, active: true, archivedAt: null }, orderBy: { displayOrder: "asc" } });
  }
  const byCategory = (category: string) => {
    const items = journalOptions.filter((option) => option.category === category);
    if (category === "INSTRUMENT" && !items.length) return EXECUTION_INSTRUMENTS.map((label) => ({ id: label, label }));
    if (category === "ENTRY_MODEL") {
      if (strategy?.entryModels.length) return strategy.entryModels.map((model) => ({ id: model.id, label: model.code }));
      if (items.length) return items;
      return ENTRY_MODEL_SHELLS.map((label) => ({ id: label, label }));
    }
    return items;
  };
  async function submit(formData: FormData) { "use server"; const id = await createCandidate(formData); redirect(`/journal/${id}`); }
  return <Shell><p className="eyebrow">New Setup</p><h1>Capture before outcome</h1>{strategy ? <section className="card"><form action={submit}><input type="hidden" name="strategyVersionId" value={strategy.id}/>
    <h2>Instrument and context</h2><div className="grid three"><label className="field">Daily Plan<select name="dailyPlanId"><option value="">No linked plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.planDate.toLocaleDateString()} · {plan.account}</option>)}</select></label><label className="field">Account<input required name="account" defaultValue="Primary account"/></label><label className="field">Instrument<select required name="instrument">{byCategory("INSTRUMENT").map((option) => <option key={option.id} value={option.label}>{option.label}</option>)}</select></label><label className="field">Entry timeframe<select required name="entryTimeframe">{ENTRY_TIMEFRAMES.map((timeframe) => <option key={timeframe}>{timeframe}</option>)}</select></label><label className="field">Custom timeframe<input name="entryTimeframeCustom" placeholder="Only when Custom is selected"/></label><label className="field">Session label<select name="sessionLabel">{SESSION_LABELS.map((session) => <option key={session}>{session}</option>)}</select></label><label className="field">Direction<select name="direction"><option>LONG</option><option>SHORT</option></select></label><label className="field">Archetype<select name="archetype"><option>Momentum</option><option>Contrarian</option><option>Transition</option></select></label></div>
    <Multi name="optionIds" label="Supply & Demand Context" options={byCategory("SUPPLY_DEMAND")}/>
    <h2>Macro and bias</h2><Multi name="optionIds" label="Macro Fundamental Bias" options={byCategory("MACRO_BIAS")}/><div className="grid two"><label className="field">Bias Evaluation (0–10)<input required name="biasEvaluation" type="number" min="0" max="10" defaultValue="5"/></label><label className="field">Bias explanation<textarea name="biasEvaluationNote"/></label></div>
    <h2>Execution</h2><div className="grid three"><label className="field">Entry Model<select name="entryModel"><option value="">Owner configuration required</option>{byCategory("ENTRY_MODEL").map((option) => <option key={option.id}>{option.label}</option>)}</select></label><label className="field">No-EM explanation<textarea name="noEntryModelExplanation" placeholder="Required when a No-EM model is selected"/></label><label className="field">Entry Evaluation (0–10)<input name="entryEvaluation" type="number" min="0" max="10" defaultValue="5"/></label></div><Multi name="optionIds" label="Entry Confluence" options={byCategory("ENTRY_CONFLUENCE")}/><Multi name="optionIds" label="Setup Type" options={byCategory("SETUP_TYPE")}/><Multi name="optionIds" label="Optional confluences" options={byCategory("OPTIONAL_CONFLUENCE")}/><p className="notice">Optional factors may strengthen the setup but cannot replace a failed mandatory rule. Realistic 2R is optional and never rejects this setup.</p>
    <div className="grid three"><label className="field">Planned entry<input name="plannedEntry" type="number" step="any"/></label><label className="field">Planned stop<input name="plannedStop" type="number" step="any"/></label><label className="field">Planned target price<input name="plannedTarget" type="number" step="any"/></label><label className="field">Planned risk %<input name="plannedRisk" type="number" step="0.01" defaultValue="2"/></label><label className="field">Planned position size<input name="plannedPositionSize" type="number" step="any"/></label></div>
    <Multi name="targetIds" label="Target" options={byCategory("TARGET")}/><div className="grid three"><label className="field">Primary target<select name="primaryTarget"><option value="">Select one target</option>{byCategory("TARGET").map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}<option value="custom">Custom target</option></select></label><label className="field">Custom target label<input name="customTargetLabel"/></label><label className="field">Custom target price<input name="customTargetPrice" type="number" step="any"/></label></div><label className="field">Target notes<textarea name="targetNotes"/></label><label className="field">Thesis<textarea name="thesis" placeholder="Location, expected path and evidence context"/></label><button>Create setup candidate</button></form></section> : <section className="card"><h2>No active strategy</h2><p className="muted">Create and publish a strategy version before creating a setup.</p><Link className="new" href="/strategy/new">Create Strategy</Link></section>}</Shell>;
}

function Multi({ name, label, options }: { name: string; label: string; options: { id: string; label: string }[] }) { return <div className="field">{label}<div className="multi-check">{options.map((option) => <label key={option.id} className="check-row"><input type="checkbox" name={name} value={option.id}/>{option.label}</label>)}</div><small className="muted">Multiple selections allowed. Custom options can be managed from a draft strategy version.</small></div>; }
