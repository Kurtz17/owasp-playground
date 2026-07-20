"use client";

import { useMemo, useState } from "react";
import {
  FIXED_CODE,
  FLOW,
  INITIAL_CART,
  ITEM_NAME,
  ITEM_PRICE,
  VOUCHER,
  VULN_CODE,
  applyVoucherFixed,
  applyVoucherVulnerable,
  formatRupiah,
  type CartState,
} from "@/lib/demos/a04";
import { CodeBlock, localizeCode } from "@/components/demo/CodeBlock";
import { DemoConsole } from "@/components/demo/DemoConsole";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { useLang } from "@/components/LanguageProvider";

type Mode = "vuln" | "fixed";

function A04Lab({ mode }: { mode: Mode }) {
  const { t, lang } = useLang();
  const code = useMemo(
    () => localizeCode(mode === "vuln" ? VULN_CODE : FIXED_CODE, lang),
    [mode, lang],
  );

  const intro =
    mode === "vuln"
      ? t({
          id: "Halaman checkout ini menghitung diskon dengan benar, tapi tidak pernah dirancang aturan berapa kali sebuah voucher boleh dipakai. Terapkan voucher berkali-kali dan lihat totalnya menembus angka nol.",
          en: "This checkout page calculates the discount correctly, but no rule was ever designed for how many times a voucher may be used. Apply the voucher repeatedly and watch the total blow past zero.",
        })
      : t({
          id: "Checkout yang sama setelah alurnya di-threat-model: voucher hanya berlaku sekali per pesanan dan total tidak boleh negatif. Penyalahgunaan yang tadi berhasil kini mustahil.",
          en: "The same checkout after its flow was threat-modeled: a voucher applies only once per order and the total can't go negative. The abuse that worked before is now impossible.",
        });

  return (
    <DemoLayout
      tone={mode === "vuln" ? "vuln" : "safe"}
      intro={intro}
      codeTitle={t({
        id: `Aturan checkout (versi ${mode === "vuln" ? "rentan" : "aman"})`,
        en: `Checkout rules (${mode === "vuln" ? "vulnerable" : "fixed"} version)`,
      })}
      code={<CodeBlock filename="server/checkout.ts" lines={code} />}
      flow={mode === "vuln" ? FLOW.vuln : FLOW.fixed}
    >
      <CheckoutLab mode={mode} />
    </DemoLayout>
  );
}

function CheckoutLab({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const [cart, setCart] = useState<CartState>(INITIAL_CART);
  const [rejected, setRejected] = useState(false);

  function applyVoucher() {
    const result =
      mode === "vuln"
        ? applyVoucherVulnerable(cart)
        : applyVoucherFixed(cart);
    setCart(result.state);
    setRejected(result.kind === "rejected");
  }

  function reset() {
    setCart(INITIAL_CART);
    setRejected(false);
  }

  const negative = cart.total < 0;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-line bg-night-raised">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 text-[13px]">
          <span className="text-cream">{t(ITEM_NAME)}</span>
          <span className="font-mono text-cream-dim">
            {formatRupiah(ITEM_PRICE)}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[13px]">
          <span className="text-cream-faint">
            {t({ id: "Voucher", en: "Voucher" })}{" "}
            <span className="font-mono text-cream-dim">{VOUCHER.code}</span>
            {cart.applied > 0 && (
              <span className="ml-2 text-cream-faint">
                &times;{cart.applied}
              </span>
            )}
          </span>
          <span className="font-mono text-cream-dim">
            {cart.applied > 0
              ? `- ${formatRupiah(VOUCHER.value * cart.applied)}`
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-[13px] font-medium text-cream">
            {t({ id: "Total bayar", en: "Total due" })}
          </span>
          <span
            className={`font-mono text-[18px] font-semibold ${
              negative ? "text-ember" : "text-cream"
            }`}
          >
            {formatRupiah(cart.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={applyVoucher}
          className={`rounded-lg px-6 py-2.5 text-[14px] font-medium text-night transition active:scale-95 ${
            mode === "vuln"
              ? "bg-ember hover:bg-ember-bright"
              : "bg-mint hover:brightness-110"
          }`}
        >
          {t({ id: "Terapkan voucher", en: "Apply voucher" })}
        </button>
        {cart.applied > 0 && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-line px-5 py-2.5 text-[14px] font-medium text-cream-dim transition hover:text-cream active:scale-95"
          >
            {t({ id: "Reset", en: "Reset" })}
          </button>
        )}
      </div>

      {rejected && (
        <DemoConsole
          request="POST /checkout/voucher"
          tone="safe"
          status={t({ id: "Ditolak", en: "Rejected" })}
        >
          <p className="text-[13px] leading-6 text-mint">
            {t({
              id: "Voucher sudah dipakai untuk pesanan ini. Aturan 'satu voucher per pesanan' menolak penerapan kedua.",
              en: "The voucher was already used on this order. The 'one voucher per order' rule rejects the second apply.",
            })}
          </p>
        </DemoConsole>
      )}

      {negative && (
        <DemoConsole
          request="POST /checkout/voucher"
          tone="vuln"
          status={t({ id: "Total negatif", en: "Negative total" })}
        >
          <p className="text-[13px] leading-6 text-ember">
            {t({
              id: `Total pembayaran menjadi ${formatRupiah(cart.total)}. Alih-alih membayar, penyerang justru "ditagih balik" oleh toko. Kodenya menghitung benar; yang hilang adalah aturan bisnis di desainnya.`,
              en: `The total became ${formatRupiah(cart.total)}. Instead of paying, the attacker gets "paid back" by the store. The code computes correctly; what's missing is the business rule in its design.`,
            })}
          </p>
        </DemoConsole>
      )}
    </div>
  );
}

export function A04Vulnerable() {
  return <A04Lab mode="vuln" />;
}

export function A04Fixed() {
  return <A04Lab mode="fixed" />;
}
