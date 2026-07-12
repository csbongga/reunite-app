"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Search, PlusCircle, User } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  /** Hides the bottom tab bar (e.g. on auth / create-post). */
  hideTabs?: boolean;
  /** Optional top bar slot. */
  topBar?: ReactNode;
}

export function AppShell({ children, hideTabs, topBar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full min-h-screen bg-background flex flex-col relative">
        {topBar}
        <main className={`flex-1 ${hideTabs ? "pb-6" : "pb-24"}`}>{children}</main>
        {!hideTabs && <BottomTabs />}
      </div>
    </div>
  );
}

function BottomTabs() {
  const path = usePathname() || "/";
  const tabs: Array<{
    to: string;
    label: string;
    icon: typeof Home;
    primary?: boolean;
    match: (p: string) => boolean;
  }> = [
    { to: "/", label: "ฟีด", icon: Home, match: (p) => p === "/" },
    { to: "/search", label: "ค้นหา", icon: Search, match: (p) => p.startsWith("/search") },
    { to: "/new", label: "โพสต์", icon: PlusCircle, primary: true, match: (p) => p.startsWith("/new") },
    { to: "/profile", label: "โปรไฟล์", icon: User, match: (p) => p.startsWith("/profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-30">
      <div className="mx-3 mb-3 rounded-2xl bg-surface/95 backdrop-blur border border-border shadow-[var(--shadow-card)]">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.match(path);
            const Icon = t.icon;
            if (t.primary) {
              return (
                <li key={t.to} className="flex justify-center items-center h-full">
                  <Link
                    href={t.to}
                    className="size-[42px] mt-1 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition"
                    aria-label={t.label}
                  >
                    <Icon className="size-5" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={t.to}>
                <Link
                  href={t.to}
                  className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition ${
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
