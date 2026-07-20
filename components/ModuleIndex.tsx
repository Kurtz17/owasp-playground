"use client";

import Link from "next/link";
import type { OwaspModule } from "@/lib/modules";
import { DifficultyBadge, StatusBadge, TimeBadge } from "./Badges";
import { useLang } from "./LanguageProvider";

export function ModuleIndex({ modules }: { modules: OwaspModule[] }) {
  return (
    <div>
      {modules.map((m, i) => (
        <ModuleRow key={m.code} module={m} index={i} />
      ))}
    </div>
  );
}

function ModuleRow({
  module: m,
  index,
}: {
  module: OwaspModule;
  index: number;
}) {
  const { t } = useLang();
  const soon = m.status === "segera-hadir";
  const titleClasses = soon
    ? "text-cream-dim group-hover:text-cream"
    : "text-cream group-hover:text-ember";

  return (
    <Link
      href={`/module/${m.slug}`}
      className="group flex items-start gap-6 border-t border-line py-8 transition-all duration-200 last:border-b hover:bg-night-raised/40 hover:pl-3 md:gap-10 md:py-9"
    >
      <span className="w-10 shrink-0 pt-2 font-mono text-[13px] text-cream-faint transition group-hover:text-ember md:w-12">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            className={`text-[20px] font-semibold leading-tight tracking-tight transition md:text-[23px] ${titleClasses}`}
          >
            {m.name}
          </span>
          <span className="font-mono text-[11px] text-cream-faint">
            {m.code}
          </span>
        </span>

        <span className="mt-3 block max-w-prose text-[15px] leading-7 text-cream-dim">
          {t(m.description)}
        </span>

        <span className="metaline mt-4">
          <DifficultyBadge difficulty={m.difficulty} />
          <TimeBadge time={t(m.estimatedTime)} />
          <StatusBadge status={m.status} />
        </span>
      </span>

      <span
        aria-hidden
        className="hidden shrink-0 -translate-x-2 self-center text-xl text-ember opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:block"
      >
        →
      </span>
    </Link>
  );
}
