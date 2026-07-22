"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BRUTE_FIXED_CODE,
  BRUTE_VULN_CODE,
  COMMON_PASSWORDS,
  FLOW,
  LOCK_THRESHOLD,
  TARGET_USERNAME,
  analyzePassword,
  bruteForceFixed,
  bruteForceVulnerable,
  type BruteForceRun,
  type PasswordChecks,
} from "@/lib/demos/a07";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { Field } from "@/components/demo/Field";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";
type Scenario = "brute" | "policy";

function A07Lab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [scenario, setScenario] = useState<Scenario>("brute");

  const intro =
    scenario === "brute"
      ? mode === "vuln"
        ? t({
            id: "Endpoint login tidak membatasi percobaan. Jalankan brute-force: penyerang mencoba daftar kata sandi umum satu per satu sampai tembus. Tidak ada yang menghentikannya.",
            en: "The login endpoint doesn't limit attempts. Run the brute-force: the attacker tries a list of common passwords one by one until it breaks in. Nothing stops it.",
          })
        : t({
            id: `Login yang sama, kini menghitung percobaan gagal dan mengunci akun setelah ${LOCK_THRESHOLD} kegagalan. Serangan berhenti sebelum kata sandi ditemukan.`,
            en: `The same login, now counting failed attempts and locking the account after ${LOCK_THRESHOLD} failures. The attack stops before the password is found.`,
          })
      : mode === "vuln"
        ? t({
            id: "Form pendaftaran ini menerima kata sandi apa pun, bahkan '123456'. Kata sandi lemah adalah pintu masuk brute-force.",
            en: "This signup form accepts any password, even '123456'. Weak passwords are the doorway to brute-force.",
          })
        : t({
            id: "Form pendaftaran yang sama, kini menolak kata sandi lemah dan menuntut kata sandi yang kuat sebelum akun dibuat.",
            en: "The same signup form, now rejecting weak passwords and requiring a strong one before the account is created.",
          });

  const bruteCode = mode === "vuln" ? BRUTE_VULN_CODE : BRUTE_FIXED_CODE;

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={
        scenario === "brute"
          ? t({
              id: `Kode login (versi ${mode === "vuln" ? "rentan" : "aman"})`,
              en: `Login code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
            })
          : t({
              id: "Aturan kekuatan kata sandi",
              en: "Password strength rules",
            })
      }
      code={
        scenario === "brute" ? (
          <A07Code lines={bruteCode} filename="server/auth.ts" />
        ) : (
          <PolicyRulesNote />
        )
      }
      flow={FLOW[scenario][mode]}
    >
      <div className="space-y-6">
        <ScenarioSwitch scenario={scenario} onChange={setScenario} />
        {scenario === "brute" ? (
          <BruteForceLab mode={mode} />
        ) : (
          <PasswordPolicyLab mode={mode} />
        )}
      </div>
    </DemoLayout>
  );
}

function A07Code({
  lines,
  filename,
}: {
  lines: Parameters<typeof localizeCode>[0];
  filename: string;
}) {
  const { lang } = useLang();
  const localized = useMemo(() => localizeCode(lines, lang), [lines, lang]);
  return <CodeBlock filename={filename} lines={localized} />;
}

function ScenarioSwitch({
  scenario,
  onChange,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}) {
  const { t } = useLang();
  const options: { id: Scenario; label: string }[] = [
    { id: "brute", label: t({ id: "Brute-force", en: "Brute-force" }) },
    {
      id: "policy",
      label: t({ id: "Kekuatan kata sandi", en: "Password strength" }),
    },
  ];
  return (
    <div className="inline-flex rounded-lg border border-line p-0.5">
      {options.map((o) => {
        const active = scenario === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition ${
              active ? "bg-cream text-night" : "text-cream-dim hover:text-cream"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function BruteForceLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [run, setRun] = useState<BruteForceRun | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (revealed >= run.attempts.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 280);
    return () => clearTimeout(id);
  }, [run, revealed]);

  function start() {
    setRevealed(0);
    setRun(mode === "vuln" ? bruteForceVulnerable() : bruteForceFixed());
  }

  const done = run !== null && revealed >= run.attempts.length;
  const shown = run ? run.attempts.slice(0, revealed) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-night-raised px-4 py-3 text-[13px]">
        <span className="text-cream-faint">
          {t({ id: "Akun target:", en: "Target account:" })}
        </span>
        <span className="font-mono text-cream">{TARGET_USERNAME}</span>
        <span className="text-cream-faint">
          {t({
            id: `· ${COMMON_PASSWORDS.length} kata sandi umum akan dicoba`,
            en: `· ${COMMON_PASSWORDS.length} common passwords will be tried`,
          })}
        </span>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={run !== null && !done}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition disabled:opacity-50 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {run === null
          ? t({ id: "Jalankan brute-force", en: "Run brute-force" })
          : !done
            ? t({ id: "Menyerang...", en: "Attacking..." })
            : t({ id: "Ulangi", en: "Run again" })}
      </button>

      {run && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="font-mono text-[12px] text-cream-faint">
                {t({ id: "log percobaan", en: "attempt log" })}
              </span>
              <span className="font-mono text-[12px] text-cream-faint">
                {revealed}/{run.attempts.length}
              </span>
            </div>
            <div className="scrollbar-thin max-h-64 overflow-y-auto px-4 py-3">
              {shown.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-1 font-mono text-[13px]"
                >
                  <span className="text-cream-faint">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 truncate text-cream-dim">
                    {a.password}
                  </span>
                  <span
                    className={a.matched ? "text-mint" : "text-cream-faint"}
                  >
                    {a.matched
                      ? t({ id: "cocok", en: "match" })
                      : t({ id: "salah", en: "wrong" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {done && <BruteForceVerdict run={run} />}
        </div>
      )}
    </div>
  );
}

function BruteForceVerdict({ run }: { run: BruteForceRun }) {
  const { t } = useLang();

  if (run.outcome === "cracked") {
    return (
      <DemoConsole
        request={`POST /login (${run.attempts.length}x)`}
        tone="vuln"
        status={t({ id: "Kata sandi jebol", en: "Password cracked" })}
      >
        <p className="text-[13px] leading-6 text-ember">
          {t({
            id: `Kata sandi ditemukan setelah ${run.attempts.length} percobaan: `,
            en: `Password found after ${run.attempts.length} attempts: `,
          })}
          <span className="font-mono font-semibold">
            {run.crackedPassword}
          </span>
          . {t({ id: "Akun diambil alih.", en: "Account taken over." })}
        </p>
      </DemoConsole>
    );
  }

  if (run.outcome === "locked") {
    return (
      <DemoConsole
        request={`POST /login (${run.attempts.length}x)`}
        tone="safe"
        status={t({ id: "Akun dikunci", en: "Account locked" })}
      >
        <p className="text-[13px] leading-6 text-mint">
          {t({
            id: `Akun dikunci setelah ${LOCK_THRESHOLD} percobaan gagal. Serangan berhenti sebelum mencapai kata sandi yang benar.`,
            en: `Account locked after ${LOCK_THRESHOLD} failed attempts. The attack stopped before reaching the correct password.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  return (
    <DemoConsole
      request="POST /login"
      tone="netral"
      status={t({ id: "Gagal", en: "Failed" })}
    >
      <p className="text-[13px] leading-6 text-cream-dim">
        {t({
          id: "Daftar kata sandi habis tanpa kecocokan.",
          en: "Ran out of passwords without a match.",
        })}
      </p>
    </DemoConsole>
  );
}

const CHECK_LABELS: {
  key: keyof PasswordChecks;
  label: { id: string; en: string };
}[] = [
  { key: "length", label: { id: "Minimal 12 karakter", en: "At least 12 characters" } },
  { key: "upperLower", label: { id: "Huruf besar & kecil", en: "Upper & lowercase" } },
  { key: "digit", label: { id: "Mengandung angka", en: "Contains a digit" } },
  { key: "symbol", label: { id: "Mengandung simbol", en: "Contains a symbol" } },
  { key: "notCommon", label: { id: "Bukan kata sandi umum", en: "Not a common password" } },
];

const STRENGTH_LABEL: { id: string; en: string }[] = [
  { id: "Sangat lemah", en: "Very weak" },
  { id: "Lemah", en: "Weak" },
  { id: "Sedang", en: "Fair" },
  { id: "Cukup", en: "Decent" },
  { id: "Kuat", en: "Strong" },
  { id: "Sangat kuat", en: "Very strong" },
];

function PasswordPolicyLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [pw, setPw] = useState("");
  const [submitted, setSubmitted] = useState<{ pw: string; ok: boolean } | null>(
    null,
  );

  const strength = analyzePassword(pw);
  const strongEnough =
    strength.checks.length &&
    strength.checks.upperLower &&
    strength.checks.digit &&
    strength.checks.notCommon;

  function submit() {
    const ok = mode === "vuln" ? pw.length > 0 : strongEnough;
    setSubmitted({ pw, ok });
  }

  const barColor =
    strength.score <= 1
      ? "bg-ember"
      : strength.score <= 3
        ? "bg-gold"
        : "bg-mint";

  return (
    <div className="space-y-5">
      <div className="sm:max-w-sm">
        <Field
          label={t({ id: "Kata sandi baru", en: "New password" })}
          value={pw}
          onChange={setPw}
          mono
          placeholder={t({ id: "ketik kata sandi...", en: "type a password..." })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
          <span className="w-24 text-right text-[12px] text-cream-dim">
            {t(STRENGTH_LABEL[strength.score])}
          </span>
        </div>

        <ul className="grid gap-1.5 sm:grid-cols-2">
          {CHECK_LABELS.map((c) => {
            const passed = strength.checks[c.key];
            return (
              <li
                key={c.key}
                className={`flex items-center gap-2 text-[13px] ${
                  passed ? "text-cream" : "text-cream-faint"
                }`}
              >
                <span className={passed ? "text-mint" : "text-cream-faint"}>
                  {passed ? "✓" : "○"}
                </span>
                {t(c.label)}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={submit}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {t({ id: "Daftar", en: "Sign up" })}
      </button>

      {submitted && (
        <PolicyVerdict mode={mode} submitted={submitted} />
      )}
    </div>
  );
}

function PolicyVerdict({
  mode,
  submitted,
}: {
  mode: Mode;
  submitted: { pw: string; ok: boolean };
}) {
  const { t } = useLang();

  if (!submitted.ok) {
    return (
      <DemoConsole
        request="POST /signup"
        tone="safe"
        status={t({ id: "Ditolak", en: "Rejected" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: "Kata sandi terlalu lemah untuk dibuat. Penuhi semua syarat inti di atas dulu.",
            en: "Password too weak to create. Meet all the core requirements above first.",
          })}
        </p>
      </DemoConsole>
    );
  }

  const weakAccepted = mode === "vuln";
  return (
    <DemoConsole
      request="POST /signup"
      tone={weakAccepted ? "vuln" : "safe"}
      status={t({ id: "Akun dibuat", en: "Account created" })}
    >
      <p
        className={`text-[13px] leading-6 ${weakAccepted ? "text-ember" : "text-mint"}`}
      >
        {weakAccepted
          ? t({
              id: "Akun dibuat walau kata sandinya lemah. Inilah yang membuat brute-force jadi mudah.",
              en: "Account created even with a weak password. This is exactly what makes brute-force easy.",
            })
          : t({
              id: "Akun dibuat dengan kata sandi yang kuat.",
              en: "Account created with a strong password.",
            })}
      </p>
    </DemoConsole>
  );
}

function PolicyRulesNote() {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-line bg-night-raised p-5 text-[13px] leading-7 text-cream-dim">
      {t({
        id: "Kebijakan yang baik menuntut kata sandi panjang dan unik, memeriksa daftar kata sandi yang sudah bocor, dan mendorong penggunaan password manager plus MFA. Jangan membatasi karakter atau panjang secara berlebihan.",
        en: "A good policy requires long, unique passwords, checks against known breached-password lists, and encourages a password manager plus MFA. Don't over-restrict characters or length.",
      })}
    </div>
  );
}

export function A07Vulnerable() {
  return <A07Lab mode="vuln" />;
}

export function A07Fixed() {
  return <A07Lab mode="fixed" />;
}
