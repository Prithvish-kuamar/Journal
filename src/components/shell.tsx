"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { label: "WORKSPACE", items: [{ label: "Home", href: "/", icon: "⌂" }, { label: "Daily Plan", href: "/plan", icon: "◫" }, { label: "Calendar", href: "/calendar", icon: "▦" }] },
  { label: "JOURNALING", items: [{ label: "Dashboard", href: "/", icon: "◈" }, { label: "Setups", href: "/journal", icon: "◇" }, { label: "Trades", href: "/journal", icon: "↗" }, { label: "Reviews", href: "/review", icon: "✓" }, { label: "Periodic Logs", href: "/analytics", icon: "≡" }] },
  { label: "STRATEGY", items: [{ label: "Strategy Library", href: "/strategy", icon: "▤" }, { label: "Entry Models", href: "/strategy", icon: "⊹" }, { label: "Rulebook", href: "/strategy", icon: "☷" }, { label: "Evidence Library", href: "/journal", icon: "▧" }] },
  { label: "DATA", items: [{ label: "Accounts", href: "/settings", icon: "◎" }, { label: "Manage Data", href: "/settings", icon: "▣" }, { label: "Imports", href: "/settings", icon: "⇣" }] },
  { label: "SYSTEM", items: [{ label: "Settings", href: "/settings", icon: "⚙" }, { label: "Help", href: "/help", icon: "?" }] }
];

const titles: Record<string, string> = { "/": "Journaling Dashboard", "/plan": "Daily Plan", "/journal": "Setup Journal", "/review": "Post-trade Review", "/strategy": "Strategy Library", "/analytics": "Analytics", "/calendar": "Calendar", "/settings": "Settings", "/help": "Help" };

const activeFor = (pathname: string, href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Shell({ children, hideNewSetup = false }: { children: React.ReactNode; hideNewSetup?: boolean }) {
  const pathname = usePathname();
  const title = titles[pathname] ?? (pathname.startsWith("/journal") ? "Setup Journal" : "Evidence Ledger");
  return <div className="shell">
    <aside className="sidebar" aria-label="Application navigation">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">EL</span><span>Evidence Ledger<small>Strategy-first journal</small></span></Link>
      <nav className="sidebar-nav" aria-label="Primary navigation">{navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map((item) => <Link key={`${group.label}-${item.label}`} href={item.href} className={`nav-link ${activeFor(pathname, item.href) ? "active" : ""}`}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</div>)}</nav>
      <div className="sidebar-bottom"><p className="demo-note">Demo records are clearly labelled and never represent real trading history.</p><div className="account-mini"><span className="avatar" aria-hidden="true">EL</span><span><b>Demo Workspace</b><small>local development</small></span><span aria-hidden="true">⋮</span></div></div>
    </aside>
    <section className="content"><header className="topbar"><div className="topbar-title">{title}</div><div className="topbar-actions"><span className="topbar-status" title="Local journal is available. Broker synchronization is not implemented.">Local journal</span><Link className="topbar-action" href="/settings" aria-label="Open settings">⚙</Link><Link className="topbar-action" href="/review" aria-label="Open review queue">◉</Link>{!hideNewSetup && <Link className="new" href="/journal/new">+ New Setup</Link>}</div></header><main className="page">{children}</main></section>
  </div>;
}
