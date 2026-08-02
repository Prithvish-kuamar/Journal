import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Evidence Ledger", description: "Strategy-first trading journal" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
