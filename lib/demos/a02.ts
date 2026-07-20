// Demo A02 Cryptographic Failures: rainbow-table melawan MD5 tanpa salt vs bcrypt.
// Hash MD5 dihitung sungguhan; semua in-memory.

import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export interface LeakedRow {
  username: string;
  // Kata sandi asli (untuk verifikasi demo; di dunia nyata tak tersimpan).
  plaintext: string;
  md5: string;
  bcrypt: string;
  // true jika kata sandi ada di daftar umum (masuk rainbow table).
  common: boolean;
}

export const LEAKED_ROWS: LeakedRow[] = [
  {
    username: "andi",
    plaintext: "123456",
    md5: "e10adc3949ba59abbe56e057f20f883e",
    bcrypt: "$2b$12$Q8m1e8pXvY3tR0aH2kLd9uJ7wZcN4bV6sK1oP5rT3xW9yG2hB0uS",
    common: true,
  },
  {
    username: "budi",
    plaintext: "password",
    md5: "5f4dcc3b5aa765d61d8327deb882cf99",
    bcrypt: "$2b$12$7Kd2fN9pQ1rS4tU6vW8xYeH3jL5mB7nC9oD1pE3qF5rG7sH9tJ1kL",
    common: true,
  },
  {
    username: "citra",
    plaintext: "qwerty123",
    md5: "3fc0a7acf087f549ac2b266baf94b8b1",
    bcrypt: "$2b$12$M3nB5vC7xZ9aQ1wE2rT4yuJ6kL8mN0pB2vC4xZ6aQ8wE0rT2yuI",
    common: true,
  },
  {
    username: "dewi",
    plaintext: "Gunung-Merapi-88!",
    md5: "dc8bb19f23f144cfba2264edf4657853",
    bcrypt: "$2b$12$X9yG2hB0uSq8m1e8pXvY3tR0aH2kLd9uJ7wZcN4bV6sK1oP5rT3x",
    common: false, // kata sandi kuat & unik: tidak ada di rainbow table
  },
];

// Rainbow table: peta hash MD5 -> kata sandi, hanya untuk kata sandi umum.
// Inilah yang membuat MD5 tanpa salt berbahaya: pencarian instan.
export const RAINBOW_TABLE: Record<string, string> = {
  e10adc3949ba59abbe56e057f20f883e: "123456",
  "5f4dcc3b5aa765d61d8327deb882cf99": "password",
  "3fc0a7acf087f549ac2b266baf94b8b1": "qwerty123",
  "0d107d09f5bbe40cade3de5c71e9e9b7": "letmein",
  f25a2fc72690b780b2a14e140ef6a9e0: "iloveyou",
  "21232f297a57a5a743894a0e4a801fc3": "admin",
};

export type CrackStatus = "cracked" | "safe";

export interface CrackResult {
  row: LeakedRow;
  status: CrackStatus;
  // Kata sandi hasil crack, bila berhasil.
  recovered: string | null;
}

// VERSI RENTAN: cari hash MD5 tiap baris di rainbow table.
// Kata sandi umum langsung terbongkar.
export function crackVulnerable(row: LeakedRow): CrackResult {
  const recovered = RAINBOW_TABLE[row.md5] ?? null;
  return recovered
    ? { row, status: "cracked", recovered }
    : { row, status: "safe", recovered: null };
}

// VERSI AMAN: kolom tersimpan berupa bcrypt yang bersalt. Rainbow table
// (yang berbasis hash tanpa salt) tidak akan pernah cocok.
export function crackFixed(row: LeakedRow): CrackResult {
  // bcrypt tidak bisa dicari di rainbow table biasa: selalu "aman" di sini.
  return { row, status: "safe", recovered: null };
}

export function countCracked(results: CrackResult[]): number {
  return results.filter((r) => r.status === "cracked").length;
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Database bocor", en: "Database leaks" },
    { id: "Hash MD5 tanpa salt", en: "Unsalted MD5 hash" },
    { id: "Kata sandi terbongkar", en: "Passwords cracked" },
  ],
  fixed: [
    { id: "Database bocor", en: "Database leaks" },
    { id: "Hash bcrypt bersalt", en: "Salted bcrypt hash" },
    { id: "Tetap tak terbaca", en: "Still unreadable" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "import { createHash } from 'crypto';" },
  { text: "" },
  { text: "function simpanKataSandi(user, password) {" },
  {
    text: "  const hash = createHash('md5')",
    highlight: "vuln",
    note: {
      id: "MD5 sangat cepat dan tanpa salt: input yang sama selalu menghasilkan hash yang sama. Penyerang cukup mencari hash di tabel pra-hitung (rainbow table).",
      en: "MD5 is very fast and unsalted: the same input always yields the same hash. An attacker just looks the hash up in a precomputed table (a rainbow table).",
    },
  },
  { text: "    .update(password).digest('hex');" },
  { text: "" },
  { text: "  db.save({ user, hash });" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "import bcrypt from 'bcrypt';" },
  { text: "" },
  { text: "async function simpanKataSandi(user, password) {" },
  {
    text: "  const hash = await bcrypt.hash(password, 12);",
    highlight: "safe",
    note: {
      id: "bcrypt menambah salt acak untuk tiap kata sandi dan sengaja lambat (faktor kerja 12). Hash jadi unik dan rainbow table tidak berguna.",
      en: "bcrypt adds a random salt per password and is deliberately slow (work factor 12). Hashes become unique and rainbow tables are useless.",
    },
  },
  { text: "" },
  { text: "  db.save({ user, hash });" },
  { text: "}" },
];
