"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ALERT_THRESHOLD,
  EVENTS,
  FIXED_CODE,
  FLOW,
  VULN_CODE,
  detectFixed,
  detectVulnerable,
  type Detection,
} from "@/lib/demos/a09";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function A09Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Aplikasi ini tidak mencatat maupun memantau aktivitas keamanan. Jalankan serangan dan perhatikan: peristiwa berlalu begitu saja, tak ada yang menyadarinya.",
          en: "This app doesn't log or monitor security activity. Run the attack and watch: the events just pass by, and nobody notices.",
        })
      : t({
          id: "Aplikasi yang sama, kini mencatat tiap kejadian dan punya aturan alert. Serangan yang sama langsung memicu peringatan setelah beberapa percobaan gagal.",
          en: "The same app, now logging every event and armed with an alert rule. The same attack triggers a warning right after a few failed attempts.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `Kode penanganan login (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Login handler code (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="server/auth.ts" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <MonitoringLab mode={mode} />
    </DemoLayout>
  );
}

function MonitoringLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [detection, setDetection] = useState<Detection | null>(null);
  const [revealed, setRevealed] = useState(0);

  // Ungkap peristiwa satu per satu agar terasa seperti serangan berjalan.
  useEffect(() => {
    if (!detection) return;
    if (revealed >= EVENTS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 460);
    return () => clearTimeout(id);
  }, [detection, revealed]);

  function run() {
    setRevealed(0);
    setDetection(mode === "vuln" ? detectVulnerable() : detectFixed());
  }

  const running = detection !== null;
  const done = running && revealed >= EVENTS.length;
  const monitoringOn = mode === "fixed";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-night-raised px-4 py-3 text-[13px]">
        <span className="text-cream-faint">
          {t({ id: "Pemantauan:", en: "Monitoring:" })}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 font-mono ${
            monitoringOn ? "text-mint" : "text-ember"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${monitoringOn ? "bg-mint" : "bg-ember"}`}
          />
          {monitoringOn ? "ON" : "OFF"}
        </span>
        <span className="text-cream-faint">
          {t({
            id: `· aturan alert: ${ALERT_THRESHOLD} login gagal`,
            en: `· alert rule: ${ALERT_THRESHOLD} failed logins`,
          })}
        </span>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={running && !done}
        className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 disabled:opacity-50 ${
          mode === "vuln"
            ? "bg-ember hover:bg-ember-bright"
            : "bg-mint hover:brightness-110"
        }`}
      >
        {!running
          ? t({ id: "Jalankan serangan", en: "Run the attack" })
          : !done
            ? t({ id: "Berjalan...", en: "Running..." })
            : t({ id: "Ulangi", en: "Run again" })}
      </button>

      {detection && (
        <div className="space-y-3">
          <EventStream
            detection={detection}
            revealed={revealed}
            monitoringOn={monitoringOn}
          />
          {done && <MonitoringVerdict mode={mode} detection={detection} />}
        </div>
      )}
    </div>
  );
}

function EventStream({
  detection,
  revealed,
  monitoringOn,
}: {
  detection: Detection;
  revealed: number;
  monitoringOn: boolean;
}) {
  const { t } = useLang();

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[12px] text-cream-faint">
          {monitoringOn
            ? t({ id: "log keamanan", en: "security log" })
            : t({ id: "lalu lintas (tak dicatat)", en: "traffic (not logged)" })}
        </span>
        <span className="font-mono text-[12px] text-cream-faint">
          {Math.min(revealed, EVENTS.length)}/{EVENTS.length}
        </span>
      </div>
      <div className="scrollbar-thin max-h-72 overflow-y-auto px-4 py-3">
        {EVENTS.slice(0, revealed).map((e, i) => {
          const showAlert =
            monitoringOn && detection.alertIndex === i;
          return (
            <Fragment key={i}>
              <div className="flex items-center gap-3 py-1 font-mono text-[12.5px]">
                <span className="shrink-0 text-cream-faint">{e.time}</span>
                <span className="shrink-0 text-cream-dim">{e.ip}</span>
                <span
                  className={`flex-1 truncate ${
                    e.level === "crit"
                      ? "text-ember"
                      : monitoringOn
                        ? "text-cream"
                        : "text-cream-faint"
                  }`}
                >
                  {t(e.action)}
                </span>
              </div>
              {showAlert && (
                <div className="my-1.5 flex items-center gap-2 rounded-md border border-mint/40 bg-mint/[0.08] px-3 py-2 text-[12px] font-medium text-mint">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                  {t({
                    id: `ALERT: brute-force terdeteksi (${ALERT_THRESHOLD} login gagal). Tim keamanan diberi tahu.`,
                    en: `ALERT: brute-force detected (${ALERT_THRESHOLD} failed logins). Security team notified.`,
                  })}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function MonitoringVerdict({
  mode,
  detection,
}: {
  mode: Mode;
  detection: Detection;
}) {
  const { t } = useLang();

  if (mode === "vuln") {
    return (
      <DemoConsole
        request="SIEM"
        tone="vuln"
        status={t({ id: "0 alert", en: "0 alerts" })}
      >
        <p className="text-[13px] leading-6 text-ember">
          {t({
            id: "0 log tercatat, 0 alert. Akun admin diambil alih dan data pengguna diekspor, tapi tidak ada satu pun jejak. Pelanggaran seperti ini rata-rata baru ketahuan berbulan-bulan kemudian.",
            en: "0 log entries, 0 alerts. The admin account was taken over and user data exported, yet there isn't a single trace. Breaches like this take months on average to be discovered.",
          })}
        </p>
      </DemoConsole>
    );
  }

  const alertTime =
    detection.alertIndex !== null ? EVENTS[detection.alertIndex].time : "-";
  return (
    <DemoConsole
      request="SIEM"
      tone="safe"
      status={t({ id: "1 alert dipicu", en: "1 alert fired" })}
    >
      <p className="text-[13px] leading-6 text-mint">
        {t({
          id: `Serangan terdeteksi pukul ${alertTime}, hanya belasan detik setelah dimulai. Alert dikirim ke tim keamanan sehingga akun bisa segera dikunci dan penyelidikan dimulai sebelum data diekspor.`,
          en: `The attack was detected at ${alertTime}, just seconds after it began. An alert went to the security team so the account could be locked and an investigation started before data was exported.`,
        })}
      </p>
    </DemoConsole>
  );
}

export function A09Vulnerable() {
  return <A09Lab mode="vuln" />;
}

export function A09Fixed() {
  return <A09Lab mode="fixed" />;
}
