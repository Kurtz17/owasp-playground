"use client";

import { useLang } from "@/components/LanguageProvider";
import { AttackFlow } from "./AttackFlow";
import type { Localized } from "@/lib/i18n";

interface DemoLayoutProps {
  tone: "vuln" | "safe";
  intro: string;
  children: React.ReactNode;
  code: React.ReactNode;
  codeTitle?: string;
  flow?: Localized[];
}

export function DemoLayout({
  tone,
  intro,
  children,
  code,
  codeTitle,
  flow,
}: DemoLayoutProps) {
  const { t } = useLang();
  const isVuln = tone === "vuln";
  const dot = isVuln ? "bg-ember" : "bg-mint";
  const labelColor = isVuln ? "text-ember" : "text-mint";
  const label = isVuln
    ? t({ id: "Versi rentan", en: "Vulnerable version" })
    : t({ id: "Versi aman", en: "Fixed version" });

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <p className="metaline">
          <span className="inline-flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            <span className={labelColor}>{label}</span>
          </span>
        </p>
        <p className="mt-4 max-w-prose text-[15px] leading-8 text-cream-dim">
          {intro}
        </p>
        <div className="mt-5">
          <AttackFlow tone={tone} steps={flow} />
        </div>
      </div>

      {children}

      <div>
        <p className="eyebrow mb-3">
          {codeTitle ?? t({ id: "Kode di balik layar", en: "Code behind it" })}
        </p>
        {code}
      </div>
    </div>
  );
}
