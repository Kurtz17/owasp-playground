"use client";

import { useLang } from "@/components/LanguageProvider";
import type { Localized } from "@/lib/i18n";

export function AttackFlow({
  tone,
  steps,
}: {
  tone: "vuln" | "safe";
  steps?: Localized[];
}) {
  const { t } = useLang();
  const isVuln = tone === "vuln";

  const fallback: Localized[] = [
    { id: "Input pengguna", en: "User input" },
    isVuln
      ? { id: "Tanpa pemeriksaan", en: "No validation" }
      : { id: "Divalidasi", en: "Validated" },
    isVuln
      ? { id: "Sistem jebol", en: "System breached" }
      : { id: "Serangan gagal", en: "Attack blocked" },
  ];

  const list = steps && steps.length === 3 ? steps : fallback;

  const accent = isVuln
    ? "border-ember/40 bg-ember/[0.06] text-ember"
    : "border-mint/40 bg-mint/[0.06] text-mint";
  const arrow = isVuln ? "text-ember/70" : "text-mint/70";

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {list.map((step, i) => (
        <div key={i} className="flex shrink-0 items-center gap-1.5">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ${
              i === 0 ? "border-line text-cream-dim" : accent
            }`}
          >
            {t(step)}
          </span>
          {i < list.length - 1 && (
            <span aria-hidden className={`text-[13px] ${arrow}`}>
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
