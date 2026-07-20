"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FIXED_CODE,
  FLOW,
  LEAKED_ROWS,
  VULN_CODE,
  countCracked,
  crackFixed,
  crackVulnerable,
  type CrackResult,
} from "@/lib/demos/a02";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function A02Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Database aplikasi bocor. Kata sandi disimpan sebagai hash MD5 tanpa salt. Jalankan rainbow table, lalu lihat betapa cepat kata sandi umum terbongkar.",
          en: "The app's database has leaked. Passwords are stored as unsalted MD5 hashes. Run the rainbow table and see how fast common passwords fall.",
        })
      : t({
          id: "Database yang sama bocor, tapi kali ini kata sandi disimpan dengan bcrypt yang bersalt dan lambat. Rainbow table yang tadi ampuh kini tidak berguna sama sekali.",
          en: "The same database leaks, but this time passwords are stored with salted, slow bcrypt. The rainbow table that worked before is now completely useless.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `Kode penyimpanan (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Storage code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="server/password.ts" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <CrackLab mode={mode} />
    </DemoLayout>
  );
}

function CrackLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [results, setResults] = useState<CrackResult[] | null>(null);
  const [revealed, setRevealed] = useState(0);

  // Ungkap hasil crack baris demi baris agar terasa seperti proses berjalan.
  useEffect(() => {
    if (!results) return;
    if (revealed >= results.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 450);
    return () => clearTimeout(id);
  }, [results, revealed]);

  function run() {
    setRevealed(0);
    setResults(
      LEAKED_ROWS.map((row) =>
        mode === "vuln" ? crackVulnerable(row) : crackFixed(row),
      ),
    );
  }

  const done = results !== null && revealed >= results.length;
  const hashLabel = mode === "vuln" ? "md5" : "bcrypt";

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-[12px] text-cream-faint">
            {t({ id: "dump: users.sql", en: "dump: users.sql" })}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ember">
            {t({ id: "bocor", en: "leaked" })}
          </span>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse font-mono text-[12.5px]">
            <thead>
              <tr className="text-cream-faint">
                <th className="px-4 py-2 text-left font-medium">username</th>
                <th className="px-4 py-2 text-left font-medium">
                  password_{hashLabel}
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  {t({ id: "hasil", en: "result" })}
                </th>
              </tr>
            </thead>
            <tbody>
              {LEAKED_ROWS.map((row, i) => {
                const result =
                  results && i < revealed ? results[i] : null;
                const stored = mode === "vuln" ? row.md5 : row.bcrypt;
                return (
                  <tr key={row.username} className="border-t border-line-soft">
                    <td className="px-4 py-2.5 text-cream">{row.username}</td>
                    <td className="max-w-[16rem] truncate px-4 py-2.5 text-cream-faint">
                      {stored}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {!result ? (
                        <span className="text-cream-faint">–</span>
                      ) : result.status === "cracked" ? (
                        <span className="text-ember">
                          {result.recovered}
                        </span>
                      ) : (
                        <span className="text-mint">
                          {t({ id: "tak terbalik", en: "unrecovered" })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={results !== null && !done}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition disabled:opacity-50 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {results === null
          ? t({ id: "Jalankan rainbow table", en: "Run the rainbow table" })
          : !done
            ? t({ id: "Mencocokkan...", en: "Matching..." })
            : t({ id: "Ulangi", en: "Run again" })}
      </button>

      {results && done && <CrackVerdict mode={mode} results={results} />}
    </div>
  );
}

function CrackVerdict({
  mode,
  results,
}: {
  mode: Mode;
  results: CrackResult[];
}) {
  const { t } = useLang();
  const cracked = countCracked(results);
  const total = results.length;

  if (mode === "vuln") {
    return (
      <DemoConsole
        request="rainbow-table lookup"
        tone="vuln"
        status={t({ id: "Terbongkar", en: "Cracked" })}
      >
        <p className="text-[13px] leading-6 text-ember">
          {t({
            id: `${cracked} dari ${total} kata sandi terbongkar seketika lewat pencarian tabel, tanpa menebak sama sekali. Hanya kata sandi yang panjang & unik yang selamat.`,
            en: `${cracked} of ${total} passwords cracked instantly via a table lookup, with no guessing at all. Only the long, unique password survived.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  return (
    <DemoConsole
      request="rainbow-table lookup"
      tone="safe"
      status={t({ id: "Gagal total", en: "Total failure" })}
    >
      <p className="text-[13px] leading-6 text-mint">
        {t({
          id: `0 dari ${total} terbongkar. Karena bcrypt memakai salt acak per kata sandi dan sengaja lambat, rainbow table tidak bisa mencocokkan apa pun.`,
          en: `0 of ${total} cracked. Because bcrypt uses a random per-password salt and is deliberately slow, the rainbow table can't match anything.`,
        })}
      </p>
    </DemoConsole>
  );
}

export function A02Vulnerable() {
  return <A02Lab mode="vuln" />;
}

export function A02Fixed() {
  return <A02Lab mode="fixed" />;
}
