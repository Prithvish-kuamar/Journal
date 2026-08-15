import Link from "next/link";
import { Shell } from "@/components/shell";
import { guardPage } from "@/lib/supabase/page-guard";
import { prisma } from "@/lib/prisma";
import { saveCustomTargetPrice } from "@/app/actions";

export const dynamic = "force-dynamic";

const stubs: Record<string, { title: string; detail: string; action: string; href: string }> = {
  calendar: { title: "Calendar", detail: "A standalone calendar workspace will consolidate daily plans, reviews and month summaries. The live journal calendar is available on the Dashboard today.", action: "Open Dashboard calendar", href: "/" },
  analytics: { title: "Periodic Logs", detail: "Periodic analytics will be introduced after more journal history is available. Current execution metrics and analysis are available on the Dashboard.", action: "Open Dashboard", href: "/?tab=analysis" },
  help: { title: "Help", detail: "Contextual help will be added with the next workflow phase. Use the documented setup flow to create, qualify and review a record.", action: "Create a setup", href: "/journal/new" }
};

export default async function LaterPhase({ params }: { params: Promise<{ section: string }> }) {
  await guardPage();
  const { section } = await params;

  if (section === "settings") {
    const version = await prisma.strategyVersion.findFirst({ where: { status: "PUBLISHED" }, orderBy: { versionNumber: "desc" }, select: { id: true, configuration: true } });
    const config = version ? JSON.parse(version.configuration) as Record<string, unknown> : {};
    const current = config.customTargetPrice != null ? String(config.customTargetPrice) : "";
    return <Shell>
      <p className="eyebrow">Settings</p>
      <h1>Custom Target Price</h1>
      <section className="card">
        <h2>Default custom target price</h2>
        <p className="muted">Pre-fills the custom target price field when creating a new setup. Applies to the current published strategy version.</p>
        {version ? <form action={saveCustomTargetPrice}>
          <input type="hidden" name="versionId" value={version.id} />
          <div className="grid two">
            <label className="field">Custom target price<input name="customTargetPrice" type="number" step="any" defaultValue={current} placeholder="e.g. 2450.00" /></label>
          </div>
          <button>Save</button>
        </form> : <p className="muted">No published strategy version. <Link href="/strategy">Open Strategy Library</Link> to publish one.</p>}
      </section>
    </Shell>;
  }

  const item = stubs[section] ?? { title: section[0].toUpperCase() + section.slice(1), detail: "This workspace is not available in the current phase.", action: "Return Home", href: "/" };
  return <Shell><p className="eyebrow">Later phase workspace</p><h1>{item.title}</h1><div className="coming"><p>{item.detail}</p><Link className="new" href={item.href}>{item.action}</Link></div></Shell>;
}
