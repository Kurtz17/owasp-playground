// Demo A03 Injection: SQL injection & XSS, in-memory.
// Eksekusi skrip XSS hanya disimulasikan (dideteksi, tidak benar-benar dijalankan).

import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export const FLOW: Record<
  "sql" | "xss",
  Record<"vuln" | "fixed", Localized[]>
> = {
  sql: {
    vuln: [
      { id: "Payload di form login", en: "Payload in the login form" },
      { id: "Kueri disambung string", en: "Query built by string" },
      { id: "Login tembus", en: "Login bypassed" },
    ],
    fixed: [
      { id: "Payload di form login", en: "Payload in the login form" },
      { id: "Parameter terikat", en: "Bound parameters" },
      { id: "Diperlakukan sebagai teks", en: "Treated as text" },
    ],
  },
  xss: {
    vuln: [
      { id: "Input berisi <script>", en: "Input contains <script>" },
      { id: "Dirender via innerHTML", en: "Rendered via innerHTML" },
      { id: "Skrip dieksekusi", en: "Script executed" },
    ],
    fixed: [
      { id: "Input berisi <script>", en: "Input contains <script>" },
      { id: "Output di-escape", en: "Output escaped" },
      { id: "Tampil sebagai teks", en: "Shown as text" },
    ],
  },
};

// 1) SQL INJECTION

export interface DbUser {
  username: string;
  password: string;
  role: string;
}

export const DB_USERS: DbUser[] = [
  { username: "admin", password: "S3cr3t!2024", role: "admin" },
  { username: "andi", password: "andi123", role: "user" },
];

// Kueri yang dirakit dengan menyambung string (versi rentan).
export function buildLoginQuery(username: string, password: string): string {
  return `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
}

// Mengenali pola bypass SQL klasik seperti ' OR '1'='1 atau admin' --
// Cukup untuk tujuan edukasi, bukan parser SQL sungguhan.
export function isSqlBypass(username: string, password: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const u = norm(username);
  const p = norm(password);
  const patterns = [
    "'or'1'='1",
    "'or1=1",
    "'or''='",
    "'or'a'='a",
    "'--",
  ];
  const hit = (s: string) => patterns.some((pat) => s.includes(pat));
  return hit(u) || hit(p);
}

export type SqlResult =
  | { kind: "success"; user: DbUser; injected: false }
  | { kind: "bypass"; user: DbUser; injected: true }
  | { kind: "fail" };

// VERSI RENTAN: kredensial cocok ATAU pola injeksi membobol kueri.
export function loginVulnerable(username: string, password: string): SqlResult {
  const match = DB_USERS.find(
    (u) => u.username === username && u.password === password,
  );
  if (match) return { kind: "success", user: match, injected: false };
  if (isSqlBypass(username, password)) {
    // Tautologi membuat WHERE selalu benar -> baris pertama (admin) terpilih.
    return { kind: "bypass", user: DB_USERS[0], injected: true };
  }
  return { kind: "fail" };
}

// VERSI AMAN: parameter terikat, input hanya dianggap data, bukan kode.
export function loginFixed(username: string, password: string): SqlResult {
  const match = DB_USERS.find(
    (u) => u.username === username && u.password === password,
  );
  if (match) return { kind: "success", user: match, injected: false };
  return { kind: "fail" };
}

// 2) XSS (reflected)

export type XssKind = "script" | "handler" | "uri" | "html" | "none";

export interface XssAnalysis {
  kind: XssKind;
  dangerous: boolean;
  // Pesan yang "muncul" bila skrip dijalankan, mis. dari alert('...').
  alertMessage: string | null;
}

// Menganalisis payload tanpa mengeksekusinya.
export function analyzeXss(input: string): XssAnalysis {
  const alertMatch = input.match(/alert\(\s*['"`]?([^'"`)]*)['"`]?\s*\)/i);
  const alertMessage = alertMatch ? alertMatch[1] || "XSS" : null;

  if (/<script/i.test(input)) {
    return { kind: "script", dangerous: true, alertMessage: alertMessage ?? "XSS" };
  }
  if (/on\w+\s*=/i.test(input)) {
    return { kind: "handler", dangerous: true, alertMessage: alertMessage ?? "XSS" };
  }
  if (/javascript:/i.test(input)) {
    return { kind: "uri", dangerous: true, alertMessage: alertMessage ?? "XSS" };
  }
  if (/<\/?[a-z][\s\S]*>/i.test(input)) {
    // Ada tag HTML tapi tanpa skrip: injeksi HTML "jinak" (mis. <b>).
    return { kind: "html", dangerous: false, alertMessage: null };
  }
  return { kind: "none", dangerous: false, alertMessage: null };
}

// Buang seluruh tag untuk menampilkan teks yang terlihat saja (simulasi).
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export const SQL_VULN_CODE: LocalizedCodeLine[] = [
  { text: "function login(username, password) {" },
  { text: "  // Kueri dirakit dengan menyambung string." },
  {
    text: "  const q = `SELECT * FROM users",
  },
  {
    text: "    WHERE username = '${username}'",
    highlight: "vuln",
    note: {
      id: "Input pengguna disisipkan langsung ke dalam kueri. Tanda kutip pada payload bisa 'keluar' dari string dan mengubah logika SQL.",
      en: "User input is inserted straight into the query. A quote in the payload can break out of the string and rewrite the SQL logic.",
    },
  },
  { text: "    AND password = '${password}'`;" },
  { text: "" },
  { text: "  return db.query(q);" },
  { text: "}" },
];

export const SQL_FIXED_CODE: LocalizedCodeLine[] = [
  { text: "function login(username, password) {" },
  {
    text: "  const q = `SELECT * FROM users",
  },
  { text: "    WHERE username = ? AND password = ?`;", highlight: "safe" },
  { text: "" },
  {
    text: "  return db.query(q, [username, password]);",
    highlight: "safe",
    note: {
      id: "Input dikirim terpisah sebagai parameter. Database memperlakukannya murni sebagai data, tidak pernah sebagai bagian dari perintah SQL.",
      en: "Input is sent separately as parameters. The database treats it purely as data, never as part of the SQL command.",
    },
  },
  { text: "}" },
];

export const XSS_VULN_CODE: LocalizedCodeLine[] = [
  { text: "function tampilkanHasil(input) {" },
  {
    text: "  el.innerHTML = 'Hasil untuk: ' + input;",
    highlight: "vuln",
    note: {
      id: "Input ditaruh sebagai HTML mentah lewat innerHTML. Tag <script> atau atribut seperti onerror akan dieksekusi oleh browser.",
      en: "Input is placed as raw HTML via innerHTML. A <script> tag or an attribute like onerror will be executed by the browser.",
    },
  },
  { text: "}" },
];

export const XSS_FIXED_CODE: LocalizedCodeLine[] = [
  { text: "function tampilkanHasil(input) {" },
  {
    text: "  el.textContent = 'Hasil untuk: ' + input;",
    highlight: "safe",
    note: {
      id: "Dengan textContent, input hanya ditampilkan sebagai teks biasa. Tag ditulis apa adanya, bukan dijalankan.",
      en: "With textContent, input is shown as plain text. Tags appear literally instead of being executed.",
    },
  },
  { text: "}" },
];
