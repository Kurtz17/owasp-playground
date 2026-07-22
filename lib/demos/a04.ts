import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export const ITEM_NAME: Localized = {
  id: "Headphone Nirkabel",
  en: "Wireless Headphones",
};
export const ITEM_PRICE = 120000;
export const VOUCHER = { code: "HEMAT40", value: 40000 };

export interface CartState {
  applied: number;
  total: number;
}

export const INITIAL_CART: CartState = { applied: 0, total: ITEM_PRICE };

export type ApplyResult =
  | { kind: "applied"; state: CartState }
  | { kind: "rejected"; state: CartState };

export function applyVoucherVulnerable(state: CartState): ApplyResult {
  return {
    kind: "applied",
    state: {
      applied: state.applied + 1,
      total: state.total - VOUCHER.value,
    },
  };
}

export function applyVoucherFixed(state: CartState): ApplyResult {
  if (state.applied >= 1) {
    return { kind: "rejected", state };
  }
  return {
    kind: "applied",
    state: {
      applied: 1,
      total: Math.max(0, state.total - VOUCHER.value),
    },
  };
}

export function formatRupiah(n: number): string {
  const abs = Math.abs(n).toLocaleString("id-ID");
  return n < 0 ? `- Rp ${abs}` : `Rp ${abs}`;
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Terapkan voucher berulang", en: "Apply voucher repeatedly" },
    { id: "Tak ada aturan pembatas", en: "No limiting rule" },
    { id: "Total jadi negatif", en: "Total goes negative" },
  ],
  fixed: [
    { id: "Terapkan voucher berulang", en: "Apply voucher repeatedly" },
    { id: "Aturan: sekali per pesanan", en: "Rule: once per order" },
    { id: "Penerapan kedua ditolak", en: "Second apply rejected" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "function applyVoucher(cart, voucher) {" },
  {
    text: {
      id: "  // Perhitungannya benar, tapi tak ada aturan.",
      en: "  // The math is right, but there's no rule.",
    },
    highlight: "vuln",
  },
  {
    text: "  cart.total -= voucher.value;",
    highlight: "vuln",
    note: {
      id: "Baris ini tidak salah. Kelemahannya ada di DESAIN: tidak pernah ditetapkan aturan 'satu voucher per pesanan' atau 'total minimal nol'. Ini insecure design, bukan bug kode.",
      en: "This line isn't wrong. The weakness is in the DESIGN: there was never a rule for 'one voucher per order' or 'total floors at zero'. This is insecure design, not a code bug.",
    },
  },
  { text: "  return cart;" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "function applyVoucher(cart, voucher) {" },
  {
    text: "  if (cart.voucherUsed) {",
    highlight: "safe",
    note: {
      id: "Aturan bisnis dari hasil threat modeling: satu voucher per pesanan. Aturan ini bagian dari desain, ditegakkan di server.",
      en: "A business rule from threat modeling: one voucher per order. This rule is part of the design, enforced on the server.",
    },
  },
  {
    text: {
      id: "    throw new Error('Voucher sudah dipakai');",
      en: "    throw new Error('Voucher already used');",
    },
    highlight: "safe",
  },
  { text: "  }" },
  {
    text: "  cart.total = Math.max(0, cart.total - voucher.value);",
    highlight: "safe",
    note: {
      id: "Total tidak pernah boleh di bawah nol. Batasi nilai pada rentang yang masuk akal sejak dirancang.",
      en: "The total must never drop below zero. Constrain values to a sensible range by design.",
    },
  },
  { text: "  cart.voucherUsed = true;" },
  { text: "  return cart;" },
  { text: "}" },
];
