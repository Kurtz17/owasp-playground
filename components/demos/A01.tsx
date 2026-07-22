"use client";

import { useMemo, useState } from "react";
import {
  FIXED_CODE,
  FLOW,
  MAX_ID,
  MIN_ID,
  SESSION_USER_ID,
  VULN_CODE,
  getAccountFixed,
  getAccountVulnerable,
  getSessionUser,
  type AccessResult,
} from "@/lib/demos/a01";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DataRow, DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function AccountLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const me = getSessionUser();
  const [inputId, setInputId] = useState<number>(SESSION_USER_ID);
  const [result, setResult] = useState<AccessResult | null>(null);

  function jalankan() {
    const res =
      mode === "vuln"
        ? getAccountVulnerable(inputId)
        : getAccountFixed(SESSION_USER_ID, inputId);
    setResult(res);
  }

  function clamp(n: number) {
    if (Number.isNaN(n)) return MIN_ID;
    return Math.min(MAX_ID + 2, Math.max(0, n));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-night-raised px-4 py-3 text-[13px]">
        <span className="text-cream-faint">
          {t({ id: "Sesi login sebagai:", en: "Logged in as:" })}
        </span>
        <span className="font-medium text-cream">{me.nama}</span>
        <span className="font-mono text-[12px] text-cream-faint">
          (id={SESSION_USER_ID})
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="eyebrow mb-2 block">
            {t({ id: "Buka akun dengan id", en: "Open account with id" })}
          </span>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-line">
            <button
              type="button"
              aria-label={t({ id: "Kurangi id", en: "Decrease id" })}
              onClick={() => setInputId((v) => clamp(v - 1))}
              className="px-3 text-cream-dim transition hover:bg-night-high hover:text-cream"
            >
              −
            </button>
            <input
              type="number"
              value={inputId}
              onChange={(e) => setInputId(clamp(Number(e.target.value)))}
              className="w-20 border-x border-line bg-transparent px-3 py-2.5 text-center font-mono text-[15px] text-cream outline-none [appearance:textfield] focus:bg-night-raised [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label={t({ id: "Tambah id", en: "Increase id" })}
              onClick={() => setInputId((v) => clamp(v + 1))}
              className="px-3 text-cream-dim transition hover:bg-night-high hover:text-cream"
            >
              +
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={jalankan}
          className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
            mode === "vuln"
              ? "bg-ember hover:bg-ember-bright"
              : "bg-mint hover:brightness-110"
          }`}
        >
          {t({ id: "Lihat Akun", en: "View Account" })}
        </button>
      </div>

      <p className="text-[13px] text-cream-faint">
        {t({
          id: `Coba ganti id ke ${MIN_ID + 1}, ${MIN_ID + 2}, atau ${MAX_ID} lalu tekan tombol.`,
          en: `Try changing the id to ${MIN_ID + 1}, ${MIN_ID + 2}, or ${MAX_ID}, then press the button.`,
        })}
      </p>

      {result && <ResultView mode={mode} inputId={inputId} result={result} />}
    </div>
  );
}

function ResultView({
  mode,
  inputId,
  result,
}: {
  mode: Mode;
  inputId: number;
  result: AccessResult;
}) {
  const { t } = useLang();
  const request = `GET /api/akun?id=${inputId}`;

  if (result.kind === "denied") {
    return (
      <DemoConsole
        request={request}
        tone="safe"
        status={t({ id: "403 Ditolak", en: "403 Denied" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: `Akses ditolak. Akun id=${result.attemptedId} bukan milik sesi yang sedang login, jadi server menolak sebelum data apa pun dikirim.`,
            en: `Access denied. Account id=${result.attemptedId} doesn't belong to the current session, so the server rejects it before any data is sent.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  if (result.kind === "not-found") {
    return (
      <DemoConsole
        request={request}
        tone="netral"
        status={t({ id: "404 Tidak ada", en: "404 Not found" })}
      >
        <p className="text-[13px] leading-6 text-cream-dim">
          {t({
            id: `Tidak ada akun dengan id=${result.attemptedId}.`,
            en: `No account with id=${result.attemptedId}.`,
          })}
        </p>
      </DemoConsole>
    );
  }

  const { account, leaked } = result;
  const tone = leaked ? "vuln" : "safe";
  const status = leaked
    ? t({ id: "200 OK (data bocor)", en: "200 OK (data leaked)" })
    : "200 OK";

  return (
    <div className="space-y-3">
      {leaked && mode === "vuln" && (
        <p className="rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-3 text-[13px] leading-6 text-ember">
          {t({
            id: "Kamu baru saja membuka data milik ",
            en: "You just opened data belonging to ",
          })}
          <b>{account.nama}</b>
          {t({
            id: " padahal login sebagai orang lain. Inilah kebocoran akibat IDOR.",
            en: " while logged in as someone else. This is the leak caused by IDOR.",
          })}
        </p>
      )}
      <DemoConsole request={request} tone={tone} status={status}>
        <div className="space-y-0">
          <DataRow label="ID" value={String(account.id)} />
          <DataRow
            label={t({ id: "Nama", en: "Name" })}
            value={account.nama}
            sensitive={leaked}
          />
          <DataRow label="Email" value={account.email} sensitive={leaked} />
          <DataRow
            label={t({ id: "Saldo", en: "Balance" })}
            value={account.saldo}
            sensitive={leaked}
          />
          <DataRow
            label={t({ id: "Catatan", en: "Note" })}
            value={t(account.catatan)}
            sensitive={leaked}
          />
        </div>
      </DemoConsole>
    </div>
  );
}

export function A01Vulnerable() {
  const { t, lang } = useLang();
  const code = useMemo(() => localizeCode(VULN_CODE, lang), [lang]);

  return (
    <DemoLayout
      tone="vuln"
      intro={t({
        id: "Kamu login sebagai Andi (id=1). Halaman ini memanggil endpoint yang mengambil akun langsung dari id di URL. Coba ubah id ke akun lain: server tetap mengembalikan datanya, termasuk saldo dan catatan rahasia.",
        en: "You're logged in as Andi (id=1). This page calls an endpoint that fetches the account straight from the id in the URL. Change the id to another account: the server still returns its data, including the balance and secret note.",
      })}
      code={<CodeBlock filename="server/account.ts" lines={code} />}
      codeTitle={t({
        id: "Kode server (versi rentan)",
        en: "Server code (vulnerable version)",
      })}
      flow={FLOW.vuln}
    >
      <AccountLab mode="vuln" />
    </DemoLayout>
  );
}

export function A01Fixed() {
  const { t, lang } = useLang();
  const code = useMemo(() => localizeCode(FIXED_CODE, lang), [lang]);

  return (
    <DemoLayout
      tone="safe"
      intro={t({
        id: "Endpoint yang sama, tapi kini memeriksa kepemilikan lebih dulu. Selama id yang diminta bukan milik sesi yang login, server menolak dengan 403 sebelum menyentuh data. Serangan yang tadi berhasil kini gagal.",
        en: "The same endpoint, but now it checks ownership first. As long as the requested id doesn't belong to the logged-in session, the server rejects it with 403 before touching any data. The attack that worked before now fails.",
      })}
      code={<CodeBlock filename="server/account.ts" lines={code} />}
      codeTitle={t({
        id: "Kode server (versi aman)",
        en: "Server code (fixed version)",
      })}
      flow={FLOW.fixed}
    >
      <AccountLab mode="fixed" />
    </DemoLayout>
  );
}
