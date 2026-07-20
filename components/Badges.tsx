"use client";

import {
  DIFFICULTY_META,
  type Difficulty,
  type ModuleStatus,
} from "@/lib/modules";
import { useLang } from "./LanguageProvider";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { t } = useLang();
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {t(meta.label)}
    </span>
  );
}

export function StatusBadge({ status }: { status: ModuleStatus }) {
  const { t } = useLang();
  if (status === "tersedia") {
    return (
      <span className="text-mint">{t({ id: "Tersedia", en: "Available" })}</span>
    );
  }
  return <span>{t({ id: "Segera hadir", en: "Coming soon" })}</span>;
}

export function TimeBadge({ time }: { time: string }) {
  return <span>&plusmn; {time}</span>;
}
