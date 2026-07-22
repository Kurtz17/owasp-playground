"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEPS_FIXED,
  DEPS_VULN,
  FIXED_CODE,
  FLOW,
  SEVERITY_META,
  VULN_CODE,
  countVulnerable,
  scan,
  type ScanRow,
} from "@/lib/demos/a06";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function A06Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Proyek ini memakai beberapa dependency versi lama. Jalankan scanner untuk mencocokkan tiap paket ke database CVE, lalu lihat berapa banyak yang ternyata rentan.",
          en: "This project uses several old dependencies. Run the scanner to match each package against a CVE database, then see how many turn out vulnerable.",
        })
      : t({
          id: "Proyek yang sama setelah dependency diperbarui melewati versi yang ditambal. Scanner yang tadi penuh temuan kini bersih.",
          en: "The same project after dependencies were updated past their patched versions. The scanner that was full of findings before is now clean.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `package.json (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `package.json (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="package.json" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <ScannerLab mode={mode} />
    </DemoLayout>
  );
}

function ScannerLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const deps = mode === "vuln" ? DEPS_VULN : DEPS_FIXED;
  const [rows, setRows] = useState<ScanRow[] | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!rows) return;
    if (revealed >= rows.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 320);
    return () => clearTimeout(id);
  }, [rows, revealed]);

  function run() {
    setRevealed(0);
    setRows(scan(deps));
  }

  const done = rows !== null && revealed >= rows.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-night-raised px-4 py-3 text-[13px]">
        <span className="text-cream-faint">
          {t({ id: "Dependency:", en: "Dependencies:" })}
        </span>
        <span className="font-mono text-cream">{deps.length}</span>
        <span className="text-cream-faint">
          {t({ id: "· dicocokkan ke database CVE", en: "· matched against a CVE database" })}
        </span>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={rows !== null && !done}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 disabled:opacity-50 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {rows === null
          ? t({ id: "Jalankan npm audit", en: "Run npm audit" })
          : !done
            ? t({ id: "Memindai...", en: "Scanning..." })
            : t({ id: "Ulangi", en: "Run again" })}
      </button>

      {rows && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="font-mono text-[12px] text-cream-faint">
                {t({ id: "hasil pindai", en: "scan results" })}
              </span>
              <span className="font-mono text-[12px] text-cream-faint">
                {Math.min(revealed, rows.length)}/{rows.length}
              </span>
            </div>
            <div className="divide-y divide-line-soft">
              {rows.slice(0, revealed).map((row, i) => (
                <ScanRowView key={i} row={row} />
              ))}
            </div>
          </div>

          {done && <ScanVerdict mode={mode} rows={rows} />}
        </div>
      )}
    </div>
  );
}

function ScanRowView({ row }: { row: ScanRow }) {
  const { t } = useLang();
  const vulnerable = row.matches.length > 0;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3 font-mono text-[13px]">
        <span className="flex items-center gap-2">
          <span className={vulnerable ? "text-ember" : "text-mint"}>
            {vulnerable ? "✗" : "✓"}
          </span>
          <span className="text-cream">{row.dep.name}</span>
          <span className="text-cream-faint">{row.dep.version}</span>
        </span>
        {vulnerable ? (
          <span className="text-[11px] uppercase tracking-wide text-ember">
            {row.matches.length} CVE
          </span>
        ) : (
          <span className="text-[11px] uppercase tracking-wide text-mint">
            {t({ id: "aman", en: "clean" })}
          </span>
        )}
      </div>

      {row.matches.map((cve) => {
        const meta = SEVERITY_META[cve.severity];
        return (
          <div
            key={cve.id}
            className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 pl-6 text-[12px]"
          >
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${meta.className}`}
            >
              {t(meta.label)}
            </span>
            <span className="font-mono text-cream-dim">{cve.id}</span>
            <span className="text-cream-faint">
              {t({ id: "→ perbaiki di", en: "→ fixed in" })} {cve.fixedIn}
            </span>
            <span className="w-full pt-0.5 text-cream-dim">
              {t(cve.summary)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScanVerdict({ mode, rows }: { mode: Mode; rows: ScanRow[] }) {
  const { t } = useLang();
  const vuln = countVulnerable(rows);
  const total = rows.length;

  if (mode === "vuln") {
    return (
      <DemoConsole
        request="npm audit"
        tone="vuln"
        status={t({ id: `${vuln} rentan`, en: `${vuln} vulnerable` })}
      >
        <p className="text-[13px] leading-6 text-ember">
          {t({
            id: `${vuln} dari ${total} dependency membawa CVE yang sudah diketahui. Kamu tidak menulis bug-nya, tapi ikut memikul risikonya selama tidak diperbarui.`,
            en: `${vuln} of ${total} dependencies carry known CVEs. You didn't write the bug, but you inherit its risk until you update.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  return (
    <DemoConsole
      request="npm audit"
      tone="safe"
      status={t({ id: "0 rentan", en: "0 vulnerable" })}
    >
      <p className="text-[13px] leading-6 text-mint">
        {t({
          id: `Semua ${total} dependency berada pada versi yang sudah ditambal. Tidak ada temuan CVE.`,
          en: `All ${total} dependencies are on patched versions. No CVE findings.`,
        })}
      </p>
    </DemoConsole>
  );
}

export function A06Vulnerable() {
  return <A06Lab mode="vuln" />;
}

export function A06Fixed() {
  return <A06Lab mode="fixed" />;
}
