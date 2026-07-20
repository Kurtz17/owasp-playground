// Demo A05 Security Misconfiguration: kredensial default, error verbose,
// dan berkas sensitif terekspos. Semua in-memory.

import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

// 1) KREDENSIAL DEFAULT

export const DEFAULT_CREDS = [
  { username: "admin", password: "admin" },
  { username: "root", password: "root" },
  { username: "admin", password: "password" },
];

// Kredensial admin yang benar (sudah diganti dari bawaan).
export const REAL_ADMIN = { username: "admin", password: "K3l0la-2024!aman" };

export type LoginKind = "default-open" | "ok" | "fail";
export interface LoginResult {
  kind: LoginKind;
  username: string;
}

function isDefault(u: string, p: string): boolean {
  return DEFAULT_CREDS.some((c) => c.username === u && c.password === p);
}

function isRealAdmin(u: string, p: string): boolean {
  return u === REAL_ADMIN.username && p === REAL_ADMIN.password;
}

// VERSI RENTAN: akun bawaan tidak pernah dinonaktifkan.
export function loginVulnerable(u: string, p: string): LoginResult {
  if (isDefault(u, p)) return { kind: "default-open", username: u };
  if (isRealAdmin(u, p)) return { kind: "ok", username: u };
  return { kind: "fail", username: u };
}

// VERSI AMAN: kredensial bawaan dihapus/diganti saat pemasangan.
export function loginFixed(u: string, p: string): LoginResult {
  if (isRealAdmin(u, p)) return { kind: "ok", username: u };
  return { kind: "fail", username: u };
}

// 2) PESAN ERROR VERBOSE

export interface ErrorResponse {
  status: string;
  body: string;
  caption: Localized;
  leaky: boolean;
}

const VERBOSE_ERROR: ErrorResponse = {
  status: "500 Internal Server Error",
  body: [
    "SequelizeDatabaseError: relation \"orders\" does not exist",
    "  at Query.run (/srv/app/node_modules/sequelize/lib/query.js:412)",
    "  at /srv/app/src/controllers/orderController.js:88:23",
    "  SQL: SELECT * FROM orders WHERE user_id = 42",
    "  DB_HOST=10.0.0.9  DB_USER=app_prod  NODE_ENV=production",
    "  app version 3.4.1 (build 8827)",
  ].join("\n"),
  caption: {
    id: "Stack trace lengkap membocorkan struktur database, kueri, alamat host internal, dan versi software, semuanya berguna bagi penyerang.",
    en: "The full stack trace leaks the database structure, the query, the internal host address, and the software version, all useful to an attacker.",
  },
  leaky: true,
};

const GENERIC_ERROR: ErrorResponse = {
  status: "500 Internal Server Error",
  body: 'Terjadi kesalahan. Silakan coba lagi.\nID insiden: 7f3c9a12 (untuk tim support)',
  caption: {
    id: "Pesan umum untuk pengguna, detail teknis hanya dicatat di log internal, bukan dikirim ke browser.",
    en: "A generic message for the user; technical details go only to internal logs, not to the browser.",
  },
  leaky: false,
};

export function triggerError(mode: "vuln" | "fixed"): ErrorResponse {
  return mode === "vuln" ? VERBOSE_ERROR : GENERIC_ERROR;
}

// 3) FILE SENSITIF TEREKSPOS

export interface ServedFile {
  sensitive: boolean;
  body: string;
  caption: Localized;
}

export const FILES: Record<string, ServedFile> = {
  "/.env": {
    sensitive: true,
    body: "DB_PASSWORD=sup3rs3cr3t\nJWT_SECRET=b7f1a9c4e2\nSTRIPE_KEY=sk_live_9Xk2...",
    caption: {
      id: "Berkas konfigurasi rahasia: kata sandi database, kunci JWT, dan kunci API pembayaran.",
      en: "The secret config file: database password, JWT key, and payment API key.",
    },
  },
  "/.git/config": {
    sensitive: true,
    body: '[remote "origin"]\n  url = git@github.com:acme/billing.git\n[user]\n  email = ops@acme.id',
    caption: {
      id: "Metadata repositori Git yang terekspos, membuka jalan mengunduh seluruh kode sumber.",
      en: "Exposed Git repository metadata, opening the door to downloading the entire source code.",
    },
  },
  "/backup.sql": {
    sensitive: true,
    body: "-- dump 2026-07-01\nINSERT INTO users VALUES (1,'andi','andi@acme.id',...);",
    caption: {
      id: "Cadangan basis data yang tertinggal di folder publik.",
      en: "A database backup left behind in a public folder.",
    },
  },
  "/index.html": {
    sensitive: false,
    body: "<!doctype html>\n<title>Acme</title>\n<h1>Selamat datang</h1>",
    caption: {
      id: "Berkas publik yang memang boleh diakses.",
      en: "A public file that is meant to be accessible.",
    },
  },
};

export type FileResult =
  | { kind: "served"; path: string; file: ServedFile; leaked: boolean }
  | { kind: "blocked"; path: string }
  | { kind: "not-found"; path: string };

export function accessVulnerable(path: string): FileResult {
  const file = FILES[path];
  if (!file) return { kind: "not-found", path };
  return { kind: "served", path, file, leaked: file.sensitive };
}

export function accessFixed(path: string): FileResult {
  const file = FILES[path];
  if (!file) return { kind: "not-found", path };
  if (file.sensitive) return { kind: "blocked", path };
  return { kind: "served", path, file, leaked: false };
}

export const FLOW: Record<
  "creds" | "errors" | "files",
  Record<"vuln" | "fixed", Localized[]>
> = {
  creds: {
    vuln: [
      { id: "Coba admin/admin", en: "Try admin/admin" },
      { id: "Akun bawaan aktif", en: "Default account active" },
      { id: "Panel admin terbuka", en: "Admin panel opens" },
    ],
    fixed: [
      { id: "Coba admin/admin", en: "Try admin/admin" },
      { id: "Bawaan dinonaktifkan", en: "Defaults disabled" },
      { id: "Login ditolak", en: "Login rejected" },
    ],
  },
  errors: {
    vuln: [
      { id: "Picu error", en: "Trigger an error" },
      { id: "Stack trace dikirim", en: "Stack trace sent" },
      { id: "Detail internal bocor", en: "Internal details leak" },
    ],
    fixed: [
      { id: "Picu error", en: "Trigger an error" },
      { id: "Hanya pesan umum", en: "Generic message only" },
      { id: "Tak ada yang bocor", en: "Nothing leaks" },
    ],
  },
  files: {
    vuln: [
      { id: "Akses /.env", en: "Access /.env" },
      { id: "Semua folder disajikan", en: "Whole folder served" },
      { id: "Rahasia terunduh", en: "Secrets downloaded" },
    ],
    fixed: [
      { id: "Akses /.env", en: "Access /.env" },
      { id: "Dotfile diblokir", en: "Dotfiles blocked" },
      { id: "Ditolak (403)", en: "Rejected (403)" },
    ],
  },
};

export const CREDS_VULN_CODE: LocalizedCodeLine[] = [
  { text: "// Setup awal aplikasi" },
  {
    text: "seedAdmin({ username: 'admin', password: 'admin' });",
    highlight: "vuln",
    note: {
      id: "Akun bawaan dibuat saat instalasi dan tidak pernah dinonaktifkan. Kredensial default ada di manual publik, jadi siapa pun tahu.",
      en: "A default account is created on install and never disabled. Default credentials are in the public manual, so everyone knows them.",
    },
  },
];

export const CREDS_FIXED_CODE: LocalizedCodeLine[] = [
  {
    text: "if (isDefaultPassword(admin)) {",
    highlight: "safe",
    note: {
      id: "Paksa penggantian kata sandi bawaan sebelum aplikasi bisa dipakai. Akun default yang tidak perlu dihapus.",
      en: "Force a change of the default password before the app can be used. Remove any unneeded default accounts.",
    },
  },
  { text: "  requirePasswordChange();", highlight: "safe" },
  { text: "}" },
];

export const ERROR_VULN_CODE: LocalizedCodeLine[] = [
  { text: "app.use((err, req, res, next) => {" },
  {
    text: "  res.status(500).send(err.stack);",
    highlight: "vuln",
    note: {
      id: "Mengirim stack trace mentah ke browser. Detail internal (kueri, host DB, versi) bocor ke siapa pun yang memicu error.",
      en: "Sends the raw stack trace to the browser. Internal details (queries, DB host, version) leak to anyone who triggers an error.",
    },
  },
  { text: "});" },
];

export const ERROR_FIXED_CODE: LocalizedCodeLine[] = [
  { text: "app.use((err, req, res, next) => {" },
  {
    text: "  logger.error(err);            // ke log internal",
    highlight: "safe",
  },
  {
    text: "  res.status(500).send('Terjadi kesalahan.');",
    highlight: "safe",
    note: {
      id: "Catat detail di log internal, tapi kirim hanya pesan umum ke pengguna. Sertakan ID insiden untuk penelusuran.",
      en: "Log details internally, but send only a generic message to the user. Include an incident id for tracing.",
    },
  },
  { text: "});" },
];

export const FILE_VULN_CODE: LocalizedCodeLine[] = [
  {
    text: "app.use(express.static('public'));",
    highlight: "vuln",
    note: {
      id: "Seluruh folder disajikan apa adanya, termasuk berkas tersembunyi seperti .env dan .git yang tak sengaja ikut ter-deploy.",
      en: "The whole folder is served as-is, including hidden files like .env and .git that were accidentally deployed.",
    },
  },
];

export const FILE_FIXED_CODE: LocalizedCodeLine[] = [
  {
    text: "app.use(blockDotfiles);   // tolak /.env, /.git, dll",
    highlight: "safe",
    note: {
      id: "Blokir berkas sensitif dan dotfile, dan jangan pernah menaruh rahasia di folder yang bisa diakses publik.",
      en: "Block sensitive files and dotfiles, and never place secrets in a publicly accessible folder.",
    },
  },
  { text: "app.use(express.static('public'));" },
];
