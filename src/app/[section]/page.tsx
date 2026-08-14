import Link from "next/link";
import { Shell } from "@/components/shell";
import { guardPage } from "@/lib/supabase/page-guard";

const sections: Record<string, { title: string; detail: string; action: string; href: string }> = {
  calendar: { title: "Calendar", detail: "A standalone calendar workspace will consolidate daily plans, reviews and month summaries. The live journal calendar is available on the Dashboard today.", action: "Open Dashboard calendar", href: "/" },
  analytics: { title: "Periodic Logs", detail: "Periodic analytics will be introduced after more journal history is available. Current execution metrics and analysis are available on the Dashboard.", action: "Open Dashboard", href: "/?tab=analysis" },
  settings: { title: "Settings", detail: "Account settings, imports and personal preferences remain a later-phase workspace. Current strategy configuration is available from the Strategy Library.", action: "Open Strategy Library", href: "/strategy" },
  help: { title: "Help", detail: "Contextual help will be added with the next workflow phase. Use the documented setup flow to create, qualify and review a record.", action: "Create a setup", href: "/journal/new" }
};
export default async function LaterPhase({ params }: { params: Promise<{ section: string }> }) { await guardPage(); const { section } = await params; const item = sections[section] ?? { title: section[0].toUpperCase() + section.slice(1), detail: "This workspace is not available in the current phase.", action: "Return Home", href: "/" }; return <Shell><p className="eyebrow">Later phase workspace</p><h1>{item.title}</h1><div className="coming"><p>{item.detail}</p><Link className="new" href={item.href}>{item.action}</Link></div></Shell>; }
