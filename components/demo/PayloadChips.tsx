"use client";

import { useLang } from "@/components/LanguageProvider";

export interface PayloadChip {
  label: string;
  value: string;
  danger?: boolean;
}

export function PayloadChips({
  chips,
  onPick,
}: {
  chips: PayloadChip[];
  onPick: (value: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1">
        {t({ id: "Payload", en: "Payload" })}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onPick(chip.value)}
          className={`rounded-full border px-3 py-1 font-mono text-[12px] transition ${
            chip.danger
              ? "border-ember/40 text-ember hover:bg-ember/10"
              : "border-line text-cream-dim hover:border-cream-faint hover:text-cream"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
