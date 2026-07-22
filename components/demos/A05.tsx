"use client";

import { useMemo, useState } from "react";
import {
  CREDS_FIXED_CODE,
  CREDS_VULN_CODE,
  ERROR_FIXED_CODE,
  ERROR_VULN_CODE,
  FILE_FIXED_CODE,
  FILE_VULN_CODE,
  FLOW,
  accessFixed,
  accessVulnerable,
  loginFixed,
  loginVulnerable,
  triggerError,
  type FileResult,
  type LoginResult,
} from "@/lib/demos/a05";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { Field } from "@/components/demo/Field";
import { PayloadChips } from "@/components/demo/PayloadChips";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";
type Scenario = "creds" | "errors" | "files";

function A05Lab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [scenario, setScenario] = useState<Scenario>("creds");

  const INTRO: Record<Scenario, { id: string; en: string }> = {
    creds:
      mode === "vuln"
        ? {
            id: "Panel admin dipasang dengan akun bawaan admin/admin dan tidak pernah diubah. Coba masuk dengan kredensial default, sesuatu yang tertulis di manual publik.",
            en: "The admin panel ships with a default admin/admin account that was never changed. Try logging in with default credentials, something written in the public manual.",
          }
        : {
            id: "Panel yang sama, kini kredensial bawaan dinonaktifkan dan wajib diganti. admin/admin tidak lagi berfungsi.",
            en: "The same panel, now with default credentials disabled and required to be changed. admin/admin no longer works.",
          },
    errors:
      mode === "vuln"
        ? {
            id: "Aplikasi mengirim stack trace lengkap ke browser saat terjadi error. Picu error dan lihat detail internal yang bocor.",
            en: "The app sends full stack traces to the browser when an error occurs. Trigger an error and see the internal details leak.",
          }
        : {
            id: "Aplikasi yang sama, kini hanya menampilkan pesan umum ke pengguna. Detail teknis dicatat di log internal.",
            en: "The same app, now showing only a generic message to the user. Technical details go to internal logs.",
          },
    files:
      mode === "vuln"
        ? {
            id: "Server menyajikan seluruh folder, termasuk berkas tersembunyi. Coba akses .env atau .git dan lihat rahasianya terbuka.",
            en: "The server serves the entire folder, including hidden files. Try accessing .env or .git and watch the secrets open up.",
          }
        : {
            id: "Server yang sama, kini memblokir dotfile dan berkas sensitif. Hanya berkas publik yang bisa diakses.",
            en: "The same server, now blocking dotfiles and sensitive files. Only public files are accessible.",
          },
  };

  const code = scenarioCode(scenario, mode);

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={t(INTRO[scenario])}
      codeTitle={t({
        id: `Konfigurasi (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Configuration (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<A05Code lines={code} />}
      flow={FLOW[scenario][mode]}
    >
      <div className="space-y-6">
        <ScenarioSwitch scenario={scenario} onChange={setScenario} />
        {scenario === "creds" && <CredsLab mode={mode} />}
        {scenario === "errors" && <ErrorsLab mode={mode} />}
        {scenario === "files" && <FilesLab mode={mode} />}
      </div>
    </DemoLayout>
  );
}

function scenarioCode(scenario: Scenario, mode: Mode) {
  if (scenario === "creds")
    return mode === "vuln" ? CREDS_VULN_CODE : CREDS_FIXED_CODE;
  if (scenario === "errors")
    return mode === "vuln" ? ERROR_VULN_CODE : ERROR_FIXED_CODE;
  return mode === "vuln" ? FILE_VULN_CODE : FILE_FIXED_CODE;
}

function A05Code({ lines }: { lines: Parameters<typeof localizeCode>[0] }) {
  const { lang } = useLang();
  const localized = useMemo(() => localizeCode(lines, lang), [lines, lang]);
  return <CodeBlock filename="server/config.ts" lines={localized} />;
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
    { id: "creds", label: t({ id: "Kredensial default", en: "Default creds" }) },
    { id: "errors", label: t({ id: "Error bocor", en: "Verbose errors" }) },
    { id: "files", label: t({ id: "File terekspos", en: "Exposed files" }) },
  ];
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-line p-0.5">
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

function CredsLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [u, setU] = useState("admin");
  const [p, setP] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);

  function submit() {
    setResult(mode === "vuln" ? loginVulnerable(u, p) : loginFixed(u, p));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:max-w-sm">
        <Field label="Username" value={u} onChange={setU} mono />
        <Field
          label={t({ id: "Kata sandi", en: "Password" })}
          value={p}
          onChange={setP}
          mono
        />
      </div>

      <PayloadChips
        chips={[
          { label: "admin / admin", value: "admin", danger: true },
          { label: "root / root", value: "root", danger: true },
        ]}
        onPick={(v) => {
          setU(v);
          setP(v);
        }}
      />

      <button
        type="button"
        onClick={submit}
        className={btnClass(mode)}
      >
        {t({ id: "Masuk", en: "Log in" })}
      </button>

      {result && <CredsResult result={result} />}
    </div>
  );
}

function CredsResult({ result }: { result: LoginResult }) {
  const { t } = useLang();
  if (result.kind === "fail") {
    return (
      <DemoConsole
        request="POST /admin/login"
        tone="safe"
        status={t({ id: "Ditolak", en: "Rejected" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: "Kredensial tidak cocok. Akun bawaan sudah dinonaktifkan.",
            en: "Credentials don't match. The default account has been disabled.",
          })}
        </p>
      </DemoConsole>
    );
  }
  const viaDefault = result.kind === "default-open";
  return (
    <DemoConsole
      request="POST /admin/login"
      tone={viaDefault ? "vuln" : "safe"}
      status={t({ id: "Masuk sebagai admin", en: "Logged in as admin" })}
    >
      <p className={`text-[13px] leading-6 ${viaDefault ? "text-ember" : "text-mint"}`}>
        {viaDefault
          ? t({
              id: "Masuk ke panel admin hanya dengan kredensial bawaan. Penyerang tidak perlu menebak apa pun.",
              en: "Logged into the admin panel using only the default credentials. The attacker had to guess nothing.",
            })
          : t({
              id: "Masuk dengan kredensial yang sah dan sudah diganti.",
              en: "Logged in with valid, changed credentials.",
            })}
      </p>
    </DemoConsole>
  );
}

function ErrorsLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [shown, setShown] = useState(false);
  const res = triggerError(mode);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => setShown(true)}
        className={btnClass(mode)}
      >
        {t({ id: "Picu error server", en: "Trigger a server error" })}
      </button>

      {shown && (
        <DemoConsole
          request="GET /orders/42"
          tone={res.leaky ? "vuln" : "safe"}
          status={res.status}
        >
          <p className="mb-3 text-[12px] leading-5 text-cream-faint">
            {t(res.caption)}
          </p>
          <pre className="scrollbar-thin overflow-x-auto rounded-md border border-line bg-[#0A0A0D] p-3 font-mono text-[12px] leading-6 text-cream-dim">
            {res.body}
          </pre>
        </DemoConsole>
      )}
    </div>
  );
}

function FilesLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [path, setPath] = useState("/.env");
  const [result, setResult] = useState<FileResult | null>(null);
  const [submitted, setSubmitted] = useState("");

  function submit() {
    setSubmitted(path);
    setResult(mode === "vuln" ? accessVulnerable(path) : accessFixed(path));
  }

  return (
    <div className="space-y-5">
      <div className="sm:max-w-sm">
        <Field
          label={t({ id: "Path yang diakses", en: "Path to access" })}
          value={path}
          onChange={setPath}
          mono
          placeholder="/.env"
        />
      </div>

      <PayloadChips
        chips={[
          { label: "/.env", value: "/.env", danger: true },
          { label: "/.git/config", value: "/.git/config", danger: true },
          { label: "/backup.sql", value: "/backup.sql", danger: true },
          { label: "/index.html", value: "/index.html" },
        ]}
        onPick={setPath}
      />

      <button type="button" onClick={submit} className={btnClass(mode)}>
        {t({ id: "Akses berkas", en: "Access file" })}
      </button>

      {result && <FileResultView result={result} path={submitted} />}
    </div>
  );
}

function FileResultView({
  result,
  path,
}: {
  result: FileResult;
  path: string;
}) {
  const { t } = useLang();
  const request = `GET ${path}`;

  if (result.kind === "not-found") {
    return (
      <DemoConsole
        request={request}
        tone="netral"
        status={t({ id: "404 Tidak ada", en: "404 Not found" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({ id: "Berkas tidak ditemukan.", en: "File not found." })}
        </p>
      </DemoConsole>
    );
  }

  if (result.kind === "blocked") {
    return (
      <DemoConsole
        request={request}
        tone="safe"
        status={t({ id: "403 Diblokir", en: "403 Blocked" })}
      >
        <p className="text-[13px] leading-6 text-mint">
          {t({
            id: "Akses ke berkas sensitif diblokir sebelum isinya terkirim.",
            en: "Access to the sensitive file is blocked before its contents are sent.",
          })}
        </p>
      </DemoConsole>
    );
  }

  const { file, leaked } = result;
  return (
    <div className="space-y-3">
      {leaked && (
        <p className="rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[13px] leading-6 text-ember">
          {t({
            id: "Berkas rahasia bisa diunduh siapa pun tanpa autentikasi. Isinya langsung memberi penyerang kunci kerajaan.",
            en: "A secret file is downloadable by anyone without authentication. Its contents hand the attacker the keys to the kingdom.",
          })}
        </p>
      )}
      <DemoConsole
        request={request}
        tone={leaked ? "vuln" : "safe"}
        status={leaked ? t({ id: "200 OK (bocor)", en: "200 OK (leaked)" }) : "200 OK"}
      >
        <p className="mb-3 text-[12px] leading-5 text-cream-faint">
          {t(file.caption)}
        </p>
        <pre className="scrollbar-thin overflow-x-auto rounded-md border border-line bg-[#0A0A0D] p-3 font-mono text-[12px] leading-6 text-cream-dim">
          {file.body}
        </pre>
      </DemoConsole>
    </div>
  );
}

function btnClass(mode: Mode) {
  return `rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
    mode === "vuln" ? "bg-ember hover:bg-ember-bright" : "bg-mint hover:brightness-110"
  }`;
}

export function A05Vulnerable() {
  return <A05Lab mode="vuln" />;
}

export function A05Fixed() {
  return <A05Lab mode="fixed" />;
}
