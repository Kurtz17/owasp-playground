"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { LanguageToggle } from "./LanguageToggle";
import { useLang } from "./LanguageProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-night/95 px-6 py-4 backdrop-blur md:hidden">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-cream"
          >
            Playground<span className="text-ember">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t({
                id: "Buka menu navigasi",
                en: "Open navigation menu",
              })}
              className="text-[13px] uppercase tracking-[0.14em] text-cream-dim transition hover:text-cream"
            >
              {t({ id: "Menu", en: "Menu" })}
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
