"use client";

import { LANGS, LANG_LABEL } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export function LanguageToggle({
  className = "",
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const { lang, setLang } = useLang();
  const vertical = orientation === "vertical";

  return (
    <div
      className={`inline-flex ${vertical ? "flex-col" : "flex-row"} items-center rounded-full border border-line p-0.5 ${className}`}
      role="group"
      aria-label="Pilih bahasa / Choose language"
    >
      {LANGS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(code)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition ${
              active
                ? "bg-cream text-night"
                : "text-cream-faint hover:text-cream"
            }`}
          >
            {LANG_LABEL[code]}
          </button>
        );
      })}
    </div>
  );
}
