import type { Localized } from "../i18n";
import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";

export interface Account {
  id: number;
  nama: string;
  email: string;
  saldo: string;
  catatan: Localized;
}

export const ACCOUNTS: Account[] = [
  {
    id: 1,
    nama: "Andi Pratama",
    email: "andi.pratama@contoh.id",
    saldo: "Rp 4.250.000",
    catatan: { id: "PIN kartu: 4021", en: "Card PIN: 4021" },
  },
  {
    id: 2,
    nama: "Budi Santoso",
    email: "budi.santoso@contoh.id",
    saldo: "Rp 18.900.000",
    catatan: { id: "PIN kartu: 7788", en: "Card PIN: 7788" },
  },
  {
    id: 3,
    nama: "Citra Dewi",
    email: "citra.dewi@contoh.id",
    saldo: "Rp 132.500.000",
    catatan: { id: "PIN kartu: 1305", en: "Card PIN: 1305" },
  },
  {
    id: 4,
    nama: "Dewi Lestari",
    email: "dewi.lestari@contoh.id",
    saldo: "Rp 7.010.000",
    catatan: { id: "PIN kartu: 9642", en: "Card PIN: 9642" },
  },
];

export const SESSION_USER_ID = 1;

export function getSessionUser(): Account {
  return ACCOUNTS.find((a) => a.id === SESSION_USER_ID) as Account;
}

export const MIN_ID = ACCOUNTS[0].id;
export const MAX_ID = ACCOUNTS[ACCOUNTS.length - 1].id;

export type AccessResult =
  | { kind: "ok"; account: Account; leaked: boolean }
  | { kind: "denied"; attemptedId: number }
  | { kind: "not-found"; attemptedId: number };

export function getAccountVulnerable(requestedId: number): AccessResult {
  const account = ACCOUNTS.find((a) => a.id === requestedId);
  if (!account) return { kind: "not-found", attemptedId: requestedId };
  return { kind: "ok", account, leaked: account.id !== SESSION_USER_ID };
}

export function getAccountFixed(
  sessionUserId: number,
  requestedId: number,
): AccessResult {
  if (requestedId !== sessionUserId) {
    return { kind: "denied", attemptedId: requestedId };
  }
  const account = ACCOUNTS.find((a) => a.id === requestedId);
  if (!account) return { kind: "not-found", attemptedId: requestedId };
  return { kind: "ok", account, leaked: false };
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Ganti id di URL", en: "Change id in the URL" },
    { id: "Tanpa cek pemilik", en: "No ownership check" },
    { id: "Data orang lain bocor", en: "Other user's data leaks" },
  ],
  fixed: [
    { id: "Ganti id di URL", en: "Change id in the URL" },
    { id: "Cek kepemilikan", en: "Ownership checked" },
    { id: "Akses ditolak (403)", en: "Access denied (403)" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "// GET /api/account?id=<id>" },
  { text: "function viewAccount(req, res) {" },
  {
    text: "  const id = Number(req.query.id);",
    note: {
      id: "id diambil mentah dari input pengguna. Nilai ini bisa diubah siapa saja lewat URL.",
      en: "The id comes straight from user input. Anyone can change this value via the URL.",
    },
  },
  { text: "" },
  {
    text: "  const account = db.getAccount(id);",
    highlight: "vuln",
    note: {
      id: "Letak kerentanan: data diambil hanya berdasarkan id, tanpa memeriksa apakah id itu milik pengguna yang login. Inilah IDOR.",
      en: "The vulnerability: data is fetched by id alone, without checking whether that id belongs to the logged-in user. This is IDOR.",
    },
  },
  { text: "" },
  { text: "  return res.json(account);" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "// GET /api/account?id=<id>" },
  { text: "function viewAccount(req, res) {" },
  { text: "  const id = Number(req.query.id);" },
  { text: "" },
  {
    text: "  if (id !== req.session.userId) {",
    highlight: "safe",
    note: {
      id: "Perbaikan: bandingkan id yang diminta dengan pemilik sesi sebelum menyentuh data apa pun.",
      en: "The fix: compare the requested id against the session owner before touching any data.",
    },
  },
  {
    text: "    return res.status(403).json({ error: 'Denied' });",
    highlight: "safe",
    note: {
      id: "Tolak lebih dulu. Data tidak akan pernah dikirim kalau bukan milik pengguna.",
      en: "Reject first. Data is never sent if it doesn't belong to the user.",
    },
  },
  { text: "  }", highlight: "safe" },
  { text: "" },
  { text: "  const account = db.getAccount(id);" },
  { text: "  return res.json(account);" },
  { text: "}" },
];
