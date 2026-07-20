"use client";

import { useState } from "react";
import Link from "next/link";
import { MODULES, type OwaspModule } from "@/lib/modules";
import { DifficultyBadge, StatusBadge, TimeBadge } from "./Badges";
import { getDemo } from "./demos/registry";
import { useLang } from "./LanguageProvider";
import type { Localized } from "@/lib/i18n";

type TabId = "teori" | "vulnerable" | "fixed";

const TABS: { id: TabId; label: Localized }[] = [
  { id: "teori", label: { id: "Teori", en: "Theory" } },
  {
    id: "vulnerable",
    label: { id: "Demo Vulnerable", en: "Vulnerable Demo" },
  },
  { id: "fixed", label: { id: "Demo Fixed", en: "Fixed Demo" } },
];

const TAB_ACTIVE_CLASSES: Record<TabId, string> = {
  teori: "border-cream text-cream",
  vulnerable: "border-ember text-ember",
  fixed: "border-mint text-mint",
};

export function ModulePage({ module: m }: { module: OwaspModule }) {
  const { t } = useLang();
  const [tab, setTab] = useState<TabId>("teori");
  const index = MODULES.findIndex((x) => x.code === m.code);

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-12">
      <ModuleHeader module={m} index={index} />

      <div
        role="tablist"
        aria-label={t({ id: "Bagian modul", en: "Module sections" })}
        className="flex gap-8 border-b border-line"
      >
        {TABS.map((tabItem) => {
          const active = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tabItem.id)}
              className={[
                "-mb-px whitespace-nowrap border-b-2 pb-4 text-[12px] font-medium uppercase tracking-[0.14em] transition",
                active
                  ? TAB_ACTIVE_CLASSES[tabItem.id]
                  : "border-transparent text-cream-faint hover:text-cream-dim",
              ].join(" ")}
            >
              {t(tabItem.label)}
            </button>
          );
        })}
      </div>

      <div className="pb-4 pt-12" key={tab}>
        {tab === "teori" && <TheoryPanel module={m} />}
        {tab === "vulnerable" && <DemoTab module={m} tab="vulnerable" />}
        {tab === "fixed" && <DemoTab module={m} tab="fixed" />}
      </div>

      <ModulePager index={index} />
    </div>
  );
}

function ModuleHeader({
  module: m,
  index,
}: {
  module: OwaspModule;
  index: number;
}) {
  const { t } = useLang();
  return (
    <header className="relative pb-14 pt-16 md:pb-16 md:pt-24">
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-12 hidden select-none font-mono text-[140px] font-medium leading-none text-cream/[0.04] md:block"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <nav className="eyebrow flex items-center gap-2">
        <Link href="/" className="transition hover:text-cream">
          {t({ id: "Indeks", en: "Index" })}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ember">{m.code}</span>
      </nav>

      <h1 className="mt-8 max-w-2xl text-[32px] font-semibold leading-[1.15] tracking-tight text-cream md:text-[42px]">
        {m.name}
      </h1>

      <p className="mt-6 max-w-prose text-[16px] leading-8 text-cream-dim">
        {t(m.description)}
      </p>

      <p className="metaline mt-8">
        <DifficultyBadge difficulty={m.difficulty} />
        <TimeBadge time={t(m.estimatedTime)} />
        <StatusBadge status={m.status} />
      </p>
    </header>
  );
}

function TheoryPanel({ module: m }: { module: OwaspModule }) {
  const { t } = useLang();
  return (
    <div>
      {m.theory.map((s, i) => (
        <section
          key={i}
          className="grid gap-4 border-t border-line-soft py-10 first:border-t-0 first:pt-0 md:grid-cols-[88px_1fr] md:gap-6"
        >
          <span className="pt-1 font-mono text-[13px] text-cream-faint">
            {m.code}.{i + 1}
          </span>
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-cream">
              {t(s.heading)}
            </h2>
            <p className="mt-4 max-w-prose text-[15px] leading-8 text-cream-dim">
              {t(s.body)}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}

function DemoTab({
  module: m,
  tab,
}: {
  module: OwaspModule;
  tab: "vulnerable" | "fixed";
}) {
  const demo = getDemo(m.slug);

  if (demo) {
    const Component = tab === "vulnerable" ? demo.Vulnerable : demo.Fixed;
    return <Component />;
  }

  return <DemoPlaceholder module={m} tab={tab} />;
}

function DemoPlaceholder({
  module: m,
  tab,
}: {
  module: OwaspModule;
  tab: "vulnerable" | "fixed";
}) {
  const { t } = useLang();
  const isVuln = tab === "vulnerable";
  const color = isVuln ? "text-ember" : "text-mint";
  const dot = isVuln ? "bg-ember" : "bg-mint";

  const heading = isVuln
    ? t({
        id: "Lab serangan sedang disiapkan",
        en: "Attack lab is being prepared",
      })
    : t({
        id: "Versi perbaikan sedang disiapkan",
        en: "The fixed version is being prepared",
      });

  const body = isVuln
    ? t({
        id: `Di sini kamu akan memasukkan payload dan menonton eksploitasi ${m.code} bekerja langsung. Aman, karena semuanya berjalan in-memory di browser.`,
        en: `Here you'll enter a payload and watch the ${m.code} exploit work live. It's safe, because everything runs in-memory in your browser.`,
      })
    : t({
        id: `Payload yang tadi berhasil akan gagal di sini. Kamu bisa membandingkan kode versi rentan dan versi aman untuk memahami mitigasi ${m.code} yang benar.`,
        en: `The payload that worked before will fail here. You can compare the vulnerable and fixed code to understand the correct ${m.code} mitigation.`,
      });

  const terminalUser = isVuln ? "attacker@sandbox" : "secure@sandbox";
  const terminalStatus = isVuln ? "unsafe" : "patched";
  const lines = isVuln
    ? [
        { prompt: true, text: "run exploit --target sandbox" },
        {
          prompt: false,
          text: t({
            id: "menyiapkan lingkungan rentan...",
            en: "preparing the vulnerable environment...",
          }),
        },
      ]
    : [
        { prompt: true, text: "run exploit --target sandbox-patched" },
        {
          prompt: false,
          text: t({
            id: "input tervalidasi, serangan diblokir.",
            en: "input validated, attack blocked.",
          }),
        },
      ];

  return (
    <div className="py-2">
      <p className="metaline">
        <span className="inline-flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {t({ id: "dalam pengembangan", en: "in development" })}
        </span>
      </p>

      <h2 className="mt-5 max-w-xl text-[22px] font-semibold leading-snug tracking-tight text-cream md:text-[25px]">
        {heading}
      </h2>

      <p className="mt-4 max-w-prose text-[15px] leading-8 text-cream-dim">
        {body}
      </p>

      <div className="mt-10 max-w-2xl overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-mono text-[12px] text-cream-faint">
            {terminalUser}:~
          </span>
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.14em] ${color}`}
          >
            {terminalStatus}
          </span>
        </div>
        <pre className="scrollbar-thin overflow-x-auto px-5 py-5 font-mono text-[13px] leading-8">
          {lines.map((l, i) => (
            <div key={i}>
              {l.prompt ? (
                <>
                  <span className={color}>$ </span>
                  <span className="text-cream">{l.text}</span>
                </>
              ) : (
                <span className="text-cream-faint">{l.text}</span>
              )}
            </div>
          ))}
          <div>
            <span className={color}>$ </span>
            <span className="animate-pulse text-cream">▍</span>
          </div>
        </pre>
      </div>
    </div>
  );
}

function ModulePager({ index }: { index: number }) {
  const { t } = useLang();
  const prev = index > 0 ? MODULES[index - 1] : null;
  const next = index < MODULES.length - 1 ? MODULES[index + 1] : null;

  return (
    <nav className="mt-16 flex items-start justify-between gap-8 border-t border-line py-10">
      {prev ? (
        <Link href={`/module/${prev.slug}`} className="group min-w-0">
          <span className="eyebrow block">
            ← {t({ id: "Sebelumnya", en: "Previous" })}
          </span>
          <span className="mt-2 block truncate text-[16px] font-semibold tracking-tight text-cream-dim transition group-hover:text-cream">
            {prev.shortName}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/module/${next.slug}`}
          className="group min-w-0 text-right"
        >
          <span className="eyebrow block">
            {t({ id: "Berikutnya", en: "Next" })} →
          </span>
          <span className="mt-2 block truncate text-[16px] font-semibold tracking-tight text-cream-dim transition group-hover:text-cream">
            {next.shortName}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
