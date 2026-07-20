"use client";

import { useMemo, useState } from "react";
import {
  FIXED_CODE,
  FLOW,
  VULN_CODE,
  fetchFixed,
  fetchVulnerable,
  type SsrfResult,
} from "@/lib/demos/a10";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { Field } from "@/components/demo/Field";
import { PayloadChips } from "@/components/demo/PayloadChips";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function A10Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Fitur ini mengambil URL yang kamu berikan di sisi server untuk membuat pratinjau. Karena tujuannya tidak diperiksa, coba arahkan ke alamat internal seperti metadata cloud dan lihat rahasianya bocor.",
          en: "This feature fetches the URL you give it on the server to build a preview. Since the destination isn't checked, try pointing it at an internal address like the cloud metadata service and watch secrets leak.",
        })
      : t({
          id: "Fitur yang sama, kini menolak alamat internal (metadata, loopback, rentang privat) dan hanya mengizinkan host di allowlist. URL internal yang tadi berhasil kini diblokir.",
          en: "The same feature, now rejecting internal addresses (metadata, loopback, private ranges) and only allowing allowlisted hosts. The internal URL that worked before is now blocked.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `Kode server (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Server code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="server/preview.ts" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <SsrfLab mode={mode} />
    </DemoLayout>
  );
}

function SsrfLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [url, setUrl] = useState("https://api.cuaca.example.com/jakarta");
  const [result, setResult] = useState<SsrfResult | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState("");

  function submit() {
    setSubmittedUrl(url);
    setResult(mode === "vuln" ? fetchVulnerable(url) : fetchFixed(url));
  }

  const chips = [
    {
      label: "169.254.169.254/latest/meta-data",
      value: "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
      danger: true,
    },
    { label: "localhost/admin", value: "http://localhost/admin", danger: true },
    { label: "10.0.0.5 (internal)", value: "http://10.0.0.5/", danger: true },
    {
      label: "api.cuaca (sah)",
      value: "https://api.cuaca.example.com/jakarta",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="sm:max-w-xl">
        <Field
          label={t({ id: "URL untuk diambil", en: "URL to fetch" })}
          value={url}
          onChange={setUrl}
          mono
          placeholder="https://..."
        />
      </div>

      <PayloadChips chips={chips} onPick={setUrl} />

      <button
        type="button"
        onClick={submit}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {t({ id: "Ambil URL", en: "Fetch URL" })}
      </button>

      {result && (
        <SsrfResultView mode={mode} url={submittedUrl} result={result} />
      )}
    </div>
  );
}

function SsrfResultView({
  mode,
  url,
  result,
}: {
  mode: Mode;
  url: string;
  result: SsrfResult;
}) {
  const { t } = useLang();
  const request = `GET ${url}`;

  if (result.kind === "invalid") {
    return (
      <DemoConsole
        request={request}
        tone="netral"
        status={t({ id: "URL tidak valid", en: "Invalid URL" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: "Format URL tidak bisa diproses. Pakai bentuk http(s)://host/...",
            en: "The URL format can't be parsed. Use the form http(s)://host/...",
          })}
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
          {result.reason === "internal"
            ? t({
                id: `Permintaan ke ${result.host} ditolak karena mengarah ke alamat internal. Server tidak akan menjangkau jaringan dalam.`,
                en: `Request to ${result.host} rejected because it targets an internal address. The server won't reach into the internal network.`,
              })
            : t({
                id: `Host ${result.host} tidak ada di allowlist, jadi ditolak. Hanya tujuan tepercaya yang boleh diambil.`,
                en: `Host ${result.host} isn't on the allowlist, so it's rejected. Only trusted destinations may be fetched.`,
              })}
        </p>
      </DemoConsole>
    );
  }

  if (result.kind === "unreachable") {
    return (
      <DemoConsole
        request={request}
        tone="netral"
        status={t({ id: "Tidak terjangkau", en: "Unreachable" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: `Tidak ada layanan di ${result.host} pada simulasi ini.`,
            en: `No service at ${result.host} in this simulation.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  // kind === "ok"
  const { response } = result;
  const leaked = mode === "vuln" && response.sensitive;

  return (
    <div className="space-y-3">
      {leaked && (
        <p className="rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[13px] leading-6 text-ember">
          {t({
            id: "Server berhasil dipaksa mengambil sumber internal dan mengembalikan isinya. Inilah SSRF: server jadi 'proxy' bagi penyerang menuju jaringan dalam.",
            en: "The server was successfully forced to fetch an internal resource and return its contents. This is SSRF: the server becomes the attacker's 'proxy' into the internal network.",
          })}
        </p>
      )}
      <DemoConsole
        request={request}
        tone={leaked ? "vuln" : "safe"}
        status={
          leaked
            ? t({ id: "200 OK (bocor)", en: "200 OK (leaked)" })
            : response.status
        }
      >
        <p className="mb-3 text-[12px] leading-5 text-cream-faint">
          {t(response.caption)}
        </p>
        <pre className="scrollbar-thin overflow-x-auto rounded-md border border-line bg-[#0A0A0D] p-3 font-mono text-[12px] leading-6 text-cream-dim">
          {response.body}
        </pre>
      </DemoConsole>
    </div>
  );
}

export function A10Vulnerable() {
  return <A10Lab mode="vuln" />;
}

export function A10Fixed() {
  return <A10Lab mode="fixed" />;
}
