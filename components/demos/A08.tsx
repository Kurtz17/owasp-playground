"use client";

import { useMemo, useState } from "react";
import {
  FIXED_CODE,
  FLOW,
  VULN_CODE,
  getPackage,
  installFixed,
  installVulnerable,
  type InstallResult,
  type PackageSource,
} from "@/lib/demos/a08";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";
import type { Localized } from "@/lib/i18n";

type Mode = "vuln" | "fixed";

function A08Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Aplikasi memasang paket update begitu diunduh, tanpa memeriksa keasliannya. Pilih sumber paket, lalu pasang, dan lihat apa yang terjadi jika paketnya disusupi penyerang.",
          en: "The app installs an update package as soon as it's downloaded, without checking its authenticity. Pick a package source, install it, and see what happens when the package was tampered with.",
        })
      : t({
          id: "Aplikasi yang sama, kini memverifikasi tanda tangan paket terhadap kunci penerbit sebelum memasang. Paket resmi lolos, paket yang disusupi ditolak.",
          en: "The same app, now verifying the package signature against the publisher key before installing. The official package passes; a tampered one is rejected.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `Kode pemasang (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Installer code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="server/updater.ts" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <UpdaterLab mode={mode} />
    </DemoLayout>
  );
}

function UpdaterLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [source, setSource] = useState<PackageSource>("tampered");
  const [result, setResult] = useState<InstallResult | null>(null);

  const pkg = getPackage(source);

  function install() {
    setResult(mode === "vuln" ? installVulnerable(pkg) : installFixed(pkg));
  }

  const sources: { id: PackageSource; label: Localized }[] = [
    { id: "official", label: { id: "Resmi", en: "Official" } },
    {
      id: "tampered",
      label: { id: "Disusupi penyerang", en: "Tampered by attacker" },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-2">
          {t({ id: "Sumber paket update", en: "Update package source" })}
        </p>
        <div className="inline-flex flex-wrap rounded-lg border border-line p-0.5">
          {sources.map((s) => {
            const active = source === s.id;
            const danger = s.id === "tampered";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSource(s.id);
                  setResult(null);
                }}
                className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? danger
                      ? "bg-ember text-night"
                      : "bg-cream text-night"
                    : "text-cream-dim hover:text-cream"
                }`}
              >
                {t(s.label)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-line bg-night-raised px-4 py-3 font-mono text-[12.5px]">
        <div className="flex justify-between gap-4">
          <span className="text-cream-faint">version</span>
          <span className="text-cream">{pkg.version}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="shrink-0 text-cream-faint">payload</span>
          <span
            className={`text-right ${pkg.malicious ? "text-ember" : "text-cream"}`}
          >
            {pkg.payload}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-cream-faint">signature</span>
          <span className="text-cream-dim">{pkg.signature}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={install}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {t({ id: "Pasang update", en: "Install update" })}
      </button>

      {result && <InstallResultView mode={mode} result={result} />}
    </div>
  );
}

function InstallResultView({
  mode,
  result,
}: {
  mode: Mode;
  result: InstallResult;
}) {
  const { t } = useLang();

  if (result.kind === "rejected") {
    return (
      <DemoConsole
        request="POST /update/install"
        tone="safe"
        status={t({ id: "Ditolak", en: "Rejected" })}
      >
        <p className="text-[13px] leading-6 text-mint">
          {t({
            id: "Tanda tangan tidak cocok dengan isi paket yang sudah diubah. Karena penyerang tidak bisa memalsukan tanda tangan penerbit, paket ditolak sebelum dipasang.",
            en: "The signature doesn't match the tampered package contents. Since the attacker can't forge the publisher's signature, the package is rejected before installing.",
          })}
        </p>
      </DemoConsole>
    );
  }

  const compromised = result.malicious;
  return (
    <div className="space-y-3">
      {compromised && mode === "vuln" && (
        <p className="rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[13px] leading-6 text-ember">
          {t({
            id: "Paket yang sudah disusupi terpasang tanpa perlawanan. backdoor.js kini berjalan di server dan mulai mencuri token sesi. Inilah kegagalan integritas.",
            en: "The tampered package installed without resistance. backdoor.js now runs on the server and starts stealing session tokens. This is an integrity failure.",
          })}
        </p>
      )}
      <DemoConsole
        request="POST /update/install"
        tone={compromised ? "vuln" : "safe"}
        status={
          compromised
            ? t({ id: "Terpasang (disusupi)", en: "Installed (compromised)" })
            : t({ id: "Terpasang", en: "Installed" })
        }
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {compromised
            ? t({
                id: "Update terpasang, tapi membawa muatan jahat.",
                en: "The update installed, but it carried a malicious payload.",
              })
            : t({
                id: "Update resmi terpasang dengan aman.",
                en: "The official update installed safely.",
              })}
        </p>
      </DemoConsole>
    </div>
  );
}

export function A08Vulnerable() {
  return <A08Lab mode="vuln" />;
}

export function A08Fixed() {
  return <A08Lab mode="fixed" />;
}
