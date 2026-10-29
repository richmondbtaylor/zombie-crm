import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sponsors from "@/components/Sponsors";

export const metadata: Metadata = {
  title: "ZombieCRM",
  description: "A half-built CRM app. Bring it back to life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="zombie-bar">
          🧟 Zombie build: it half works. Read ZOMBIE.md for what to fix.
        </div>
        <nav className="nav">
          <Link href="/" className="brand">ZombieCRM</Link>
          <Link href="/">Dashboard</Link>
          <Link href="/pipeline">Pipeline</Link>
          <Link href="/contacts">Contacts</Link>
          <Link href="/tasks">Tasks</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <main>{children}</main>
        <Sponsors />
      </body>
    </html>
  );
}
