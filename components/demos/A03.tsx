"use client";

import { useMemo, useState } from "react";
import {
  FLOW,
  SQL_FIXED_CODE,
  SQL_VULN_CODE,
  XSS_FIXED_CODE,
  XSS_VULN_CODE,
  analyzeXss,
  buildLoginQuery,
  loginFixed,
  loginVulnerable,
  stripTags,
  type SqlResult,
} from "@/lib/demos/a03";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { PayloadChips } from "@/components/demo/PayloadChips";
import { Field } from "@/components/demo/Field";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";
type Attack = "sql" | "xss";

function A03Lab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [attack, setAttack] = useState<Attack>("sql");

  const intro =
    attack === "sql"
      ? mode === "vuln"
        ? t({
            id: "Form login ini merakit kueri SQL dengan menyambung string. Masukkan payload injeksi di kolom username atau password, lalu lihat login tembus tanpa kata sandi yang benar.",
            en: "This login form builds its SQL query by concatenating strings. Put an injection payload in the username or password field and watch the login succeed without the right password.",
          })
        : t({
            id: "Form login yang sama, kini memakai parameter terikat (prepared statement). Payload injeksi yang tadi berhasil sekarang hanya dianggap teks biasa dan login gagal.",
            en: "The same login form, now using bound parameters (a prepared statement). The injection payload that worked before is treated as plain text and the login fails.",
          })
      : mode === "vuln"
        ? t({
            id: "Kotak pencarian ini menampilkan kembali input sebagai HTML mentah. Coba kirim tag <script> atau atribut onerror, lalu lihat skrip 'dieksekusi' (disimulasikan dengan aman).",
            en: "This search box echoes your input back as raw HTML. Try sending a <script> tag or an onerror attribute and watch the script 'execute' (safely simulated).",
          })
        : t({
            id: "Pencarian yang sama, tapi output-nya di-escape. Tag apa pun ditampilkan sebagai teks biasa, jadi tidak ada skrip yang berjalan.",
            en: "The same search, but the output is escaped. Any tag is shown as plain text, so no script runs.",
          });

  const sqlCode = mode === "vuln" ? SQL_VULN_CODE : SQL_FIXED_CODE;
  const xssCode = mode === "vuln" ? XSS_VULN_CODE : XSS_FIXED_CODE;

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={
        attack === "sql"
          ? t({
              id: `Kode login (versi ${mode === "vuln" ? "rentan" : "aman"})`,
              en: `Login code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
            })
          : t({
              id: `Kode render (versi ${mode === "vuln" ? "rentan" : "aman"})`,
              en: `Render code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
            })
      }
      code={
        <A03Code
          lines={attack === "sql" ? sqlCode : xssCode}
          filename={attack === "sql" ? "server/auth.ts" : "client/search.ts"}
        />
      }
      flow={FLOW[attack][mode]}
    >
      <div className="space-y-6">
        <AttackSwitch attack={attack} onChange={setAttack} />
        {attack === "sql" ? (
          <SqlLab mode={mode} />
        ) : (
          <XssLab mode={mode} />
        )}
      </div>
    </DemoLayout>
  );
}

function A03Code({
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

function AttackSwitch({
  attack,
  onChange,
}: {
  attack: Attack;
  onChange: (a: Attack) => void;
}) {
  const options: { id: Attack; label: string }[] = [
    { id: "sql", label: "SQL Injection" },
    { id: "xss", label: "XSS" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-line p-0.5">
      {options.map((o) => {
        const active = attack === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition ${
              active
                ? "bg-cream text-night"
                : "text-cream-dim hover:text-cream"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SqlLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<SqlResult | null>(null);
  const [submitted, setSubmitted] = useState<{ u: string; p: string } | null>(
    null,
  );

  function submit() {
    const res =
      mode === "vuln"
        ? loginVulnerable(username, password)
        : loginFixed(username, password);
    setResult(res);
    setSubmitted({ u: username, p: password });
  }

  const chips = [
    { label: "' OR '1'='1", value: "' OR '1'='1", danger: true },
    { label: "admin' --", value: "admin' --", danger: true },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:max-w-sm">
        <Field
          label="Username"
          value={username}
          onChange={setUsername}
          mono
        />
        <Field
          label={t({ id: "Kata sandi", en: "Password" })}
          value={password}
          onChange={setPassword}
          mono
          placeholder={t({ id: "(kosongkan)", en: "(leave empty)" })}
        />
      </div>

      <PayloadChips
        chips={chips}
        onPick={(v) => {
          setUsername(v);
          setPassword("");
        }}
      />

      <button
        type="button"
        onClick={submit}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {t({ id: "Masuk", en: "Log in" })}
      </button>

      {result && submitted && (
        <div className="space-y-3">
          <CodeBlock
            filename={t({ id: "kueri yang dijalankan", en: "executed query" })}
            lines={sqlQueryView(submitted.u, submitted.p, mode)}
          />
          <SqlResultView result={result} />
        </div>
      )}
    </div>
  );
}

function sqlQueryView(u: string, p: string, mode: Mode) {
  if (mode === "vuln") {
    return [{ text: buildLoginQuery(u, p), highlight: "vuln" as const }];
  }
  return [
    { text: "SELECT * FROM users WHERE username = ? AND password = ?" },
    { text: `-- params: [${JSON.stringify(u)}, ${JSON.stringify(p)}]`, highlight: "safe" as const },
  ];
}

function SqlResultView({ result }: { result: SqlResult }) {
  const { t } = useLang();

  if (result.kind === "fail") {
    return (
      <DemoConsole
        request="POST /login"
        tone="safe"
        status={t({ id: "Login gagal", en: "Login failed" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: "Kombinasi username dan kata sandi tidak cocok. Injeksi diperlakukan sebagai teks biasa.",
            en: "Username and password don't match. The injection was treated as plain text.",
          })}
        </p>
      </DemoConsole>
    );
  }

  const bypass = result.kind === "bypass";
  return (
    <div className="space-y-3">
      {bypass && (
        <p className="rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[13px] leading-6 text-ember">
          {t({
            id: "Login tembus tanpa kata sandi yang benar. Payload membuat klausa WHERE selalu bernilai benar, dan baris pertama (admin) langsung terpilih.",
            en: "Logged in without the correct password. The payload made the WHERE clause always true, and the first row (admin) was selected.",
          })}
        </p>
      )}
      <DemoConsole
        request="POST /login"
        tone={bypass ? "vuln" : "safe"}
        status={
          bypass
            ? t({ id: "200 Masuk (dibobol)", en: "200 Logged in (bypassed)" })
            : t({ id: "200 Masuk", en: "200 Logged in" })
        }
      >
        <p className="text-[13px] leading-6 text-cream">
          {t({ id: "Masuk sebagai ", en: "Signed in as " })}
          <span className={bypass ? "text-ember" : "text-mint"}>
            {result.user.username}
          </span>{" "}
          <span className="text-cream-faint">({result.user.role})</span>
        </p>
      </DemoConsole>
    </div>
  );
}

function XssLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const chips = [
    {
      label: "<script>alert('XSS')</script>",
      value: "<script>alert('XSS')</script>",
      danger: true,
    },
    {
      label: "<img src=x onerror=alert('pwned')>",
      value: "<img src=x onerror=alert('pwned')>",
      danger: true,
    },
    { label: "<b>halo</b>", value: "<b>halo</b>" },
  ];

  const analysis = submitted !== null ? analyzeXss(submitted) : null;

  return (
    <div className="space-y-5">
      <Field
        label={t({ id: "Kata kunci pencarian", en: "Search query" })}
        value={input}
        onChange={setInput}
        mono
        placeholder={t({ id: "ketik sesuatu...", en: "type something..." })}
      />

      <PayloadChips chips={chips} onPick={setInput} />

      <button
        type="button"
        onClick={() => setSubmitted(input)}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {t({ id: "Cari", en: "Search" })}
      </button>

      {submitted !== null && analysis && (
        <XssPreview mode={mode} raw={submitted} analysis={analysis} />
      )}
    </div>
  );
}

function XssPreview({
  mode,
  raw,
  analysis,
}: {
  mode: Mode;
  raw: string;
  analysis: ReturnType<typeof analyzeXss>;
}) {
  const { t } = useLang();
  const executed = mode === "vuln" && analysis.dangerous;

  return (
    <div className="space-y-3">
      {executed && (
        <div className="rounded-lg border border-ember/30 bg-ember/[0.06] p-4">
          <p className="eyebrow mb-3 text-ember">
            {t({
              id: "Skrip dieksekusi browser (simulasi)",
              en: "Script executed by the browser (simulated)",
            })}
          </p>
          <div className="max-w-xs overflow-hidden rounded-md border border-cream/20 bg-night-high">
            <div className="border-b border-cream/10 px-3 py-1.5 text-[12px] text-cream-dim">
              {t({ id: "Pesan halaman ini", en: "This page says" })}
            </div>
            <div className="px-3 py-3 font-mono text-[13px] text-cream">
              {analysis.alertMessage}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-line bg-night-raised p-4">
        <p className="eyebrow mb-2">
          {t({ id: "Ditampilkan di halaman", en: "Rendered on the page" })}
        </p>
        {mode === "vuln" ? (
          <p className="text-[14px] text-cream">
            {t({ id: "Hasil untuk: ", en: "Results for: " })}
            {analysis.dangerous ? (
              <span className="text-cream-faint italic">
                {t({
                  id: "(skrip dijalankan, tidak tampak sebagai teks)",
                  en: "(script ran, not shown as text)",
                })}
              </span>
            ) : (
              <span className="font-semibold text-cream">
                {stripTags(raw) || raw}
              </span>
            )}
          </p>
        ) : (
          <p className="text-[14px] text-cream">
            {t({ id: "Hasil untuk: ", en: "Results for: " })}
            <span className="font-mono text-cream-dim">{raw}</span>
          </p>
        )}
      </div>

      <p className="text-[12px] leading-6 text-cream-faint">
        {mode === "vuln"
          ? t({
              id: "Catatan: eksekusi skrip di sini hanya disimulasikan demi keamanan. Pada aplikasi nyata yang rentan, kode ini benar-benar berjalan di browser korban.",
              en: "Note: script execution here is only simulated for safety. In a real vulnerable app, this code truly runs in the victim's browser.",
            })
          : t({
              id: "Perhatikan tag ditampilkan sebagai teks, bukan dijalankan.",
              en: "Notice the tags are shown as text, not executed.",
            })}
      </p>
    </div>
  );
}

export function A03Vulnerable() {
  return <A03Lab mode="vuln" />;
}

export function A03Fixed() {
  return <A03Lab mode="fixed" />;
}
