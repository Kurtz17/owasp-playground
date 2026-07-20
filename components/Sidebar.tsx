"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";
import { useLang } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={[
          "z-50 flex shrink-0 flex-col border-r border-line bg-night-raised",
          "transition-[width,transform] duration-200 ease-out",
          collapsed ? "md:w-20" : "md:w-[280px]",
          "fixed inset-y-0 left-0 w-[280px] md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="shrink-0 px-6 pb-5 pt-7">
          <div className="flex items-start justify-between">
            {!collapsed ? (
              <Link href="/" onClick={onCloseMobile} className="group">
                <span className="block text-lg font-semibold leading-none tracking-tight text-cream transition group-hover:text-ember">
                  Playground<span className="text-ember">.</span>
                </span>
                <span className="eyebrow mt-2.5 block">owasp top 10 · 2021</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="mx-auto text-lg font-semibold text-cream transition hover:text-ember"
              >
                P<span className="text-ember">.</span>
              </Link>
            )}

            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={t({ id: "Ciutkan sidebar", en: "Collapse sidebar" })}
                className="mt-0.5 hidden text-cream-faint transition hover:text-cream md:block"
              >
                ←
              </button>
            )}

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={t({ id: "Tutup menu", en: "Close menu" })}
              className="mt-0.5 text-cream-faint transition hover:text-cream md:hidden"
            >
              ✕
            </button>
          </div>

          <div className={collapsed ? "mt-6 flex justify-center" : "mt-5"}>
            <LanguageToggle
              orientation={collapsed ? "vertical" : "horizontal"}
            />
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={t({ id: "Perluas sidebar", en: "Expand sidebar" })}
              className="mx-auto mt-5 hidden text-cream-faint transition hover:text-cream md:block"
            >
              →
            </button>
          )}
        </div>

        <div className="mx-6 border-t border-line-soft" />

        <nav className="scrollbar-thin flex-1 overflow-y-auto py-4">
          {!collapsed && (
            <p className="eyebrow px-6 pb-2">{t({ id: "Modul", en: "Modules" })}</p>
          )}

          <ul className="space-y-0.5">
            {MODULES.map((m) => {
              const href = `/module/${m.slug}`;
              const active = pathname === href;
              const soon = m.status === "segera-hadir";

              return (
                <li key={m.code}>
                  <Link
                    href={href}
                    onClick={onCloseMobile}
                    title={collapsed ? `${m.code} · ${m.shortName}` : undefined}
                    className={[
                      "group flex items-center gap-3 border-l-2 text-[14px] leading-snug transition",
                      collapsed
                        ? "justify-center py-2.5"
                        : "py-2.5 pl-[22px] pr-4",
                      active
                        ? "border-ember bg-night-high/70 text-cream"
                        : [
                            "border-transparent",
                            soon
                              ? "text-cream-faint hover:text-cream-dim"
                              : "text-cream-dim hover:text-cream",
                            "hover:bg-night-high/40",
                          ].join(" "),
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "shrink-0 font-mono text-[11px]",
                        active
                          ? "text-ember"
                          : "text-cream-faint group-hover:text-ember",
                      ].join(" ")}
                    >
                      {m.code}
                    </span>

                    {!collapsed && (
                      <span className="min-w-0 flex-1 truncate">
                        {m.shortName}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="shrink-0 border-t border-line-soft px-6 py-4">
            <p className="text-[12px] leading-relaxed text-cream-faint">
              {t({
                id: "Semua demo berjalan langsung di browser. Tidak ada server sungguhan yang bisa dibobol.",
                en: "Every demo runs right in your browser. There's no real server that can be broken into.",
              })}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
