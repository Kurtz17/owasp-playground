// Demo A07 Auth Failures: brute-force (tanpa batas vs lockout) dan penilaian
// kekuatan kata sandi. Semua in-memory.

import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export const FLOW: Record<
  "brute" | "policy",
  Record<"vuln" | "fixed", Localized[]>
> = {
  brute: {
    vuln: [
      { id: "Coba ribuan kata sandi", en: "Try thousands of passwords" },
      { id: "Tanpa batas percobaan", en: "No attempt limit" },
      { id: "Akun jebol", en: "Account cracked" },
    ],
    fixed: [
      { id: "Coba ribuan kata sandi", en: "Try thousands of passwords" },
      { id: "Dikunci setelah 5 gagal", en: "Locked after 5 failures" },
      { id: "Serangan berhenti", en: "Attack stopped" },
    ],
  },
  policy: {
    vuln: [
      { id: "Daftar dgn sandi lemah", en: "Sign up with weak password" },
      { id: "Diterima apa adanya", en: "Accepted as-is" },
      { id: "Mudah ditebak", en: "Easily guessed" },
    ],
    fixed: [
      { id: "Daftar dgn sandi lemah", en: "Sign up with weak password" },
      { id: "Wajib kuat", en: "Strong required" },
      { id: "Ditolak", en: "Rejected" },
    ],
  },
};

// 1) BRUTE-FORCE

// Akun target dengan kata sandi lemah yang ada di daftar umum.
export const TARGET_USERNAME = "andi";
export const TARGET_PASSWORD = "qwerty123";

// Daftar kata sandi umum yang dicoba penyerang (urut sesuai percobaan).
export const COMMON_PASSWORDS = [
  "123456",
  "password",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "123123",
  "qwerty123", // <- cocok dengan target (percobaan ke-8)
  "iloveyou",
  "admin",
];

// Batas percobaan gagal sebelum akun dikunci (versi aman).
export const LOCK_THRESHOLD = 5;

export interface Attempt {
  password: string;
  matched: boolean;
}

export type BruteForceOutcome = "cracked" | "locked" | "exhausted";

export interface BruteForceRun {
  attempts: Attempt[];
  outcome: BruteForceOutcome;
  // Kata sandi yang berhasil ditemukan, bila cracked.
  crackedPassword: string | null;
}

// VERSI RENTAN: coba semua kata sandi tanpa batas. Berhenti saat cocok.
export function bruteForceVulnerable(): BruteForceRun {
  const attempts: Attempt[] = [];
  for (const password of COMMON_PASSWORDS) {
    const matched = password === TARGET_PASSWORD;
    attempts.push({ password, matched });
    if (matched) {
      return { attempts, outcome: "cracked", crackedPassword: password };
    }
  }
  return { attempts, outcome: "exhausted", crackedPassword: null };
}

// VERSI AMAN: akun terkunci setelah LOCK_THRESHOLD percobaan gagal,
// sebelum penyerang sempat mencapai kata sandi yang benar.
export function bruteForceFixed(): BruteForceRun {
  const attempts: Attempt[] = [];
  let failed = 0;
  for (const password of COMMON_PASSWORDS) {
    const matched = password === TARGET_PASSWORD;
    attempts.push({ password, matched });
    if (matched) {
      return { attempts, outcome: "cracked", crackedPassword: password };
    }
    failed += 1;
    if (failed >= LOCK_THRESHOLD) {
      return { attempts, outcome: "locked", crackedPassword: null };
    }
  }
  return { attempts, outcome: "exhausted", crackedPassword: null };
}

// 2) KEKUATAN KATA SANDI

export interface PasswordChecks {
  length: boolean; // minimal 12 karakter
  upperLower: boolean; // ada huruf besar & kecil
  digit: boolean; // ada angka
  symbol: boolean; // ada simbol
  notCommon: boolean; // bukan kata sandi umum
}

export interface PasswordStrength {
  score: number; // 0..5
  checks: PasswordChecks;
}

const COMMON_SET = new Set(COMMON_PASSWORDS);

export function analyzePassword(pw: string): PasswordStrength {
  const checks: PasswordChecks = {
    length: pw.length >= 12,
    upperLower: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    notCommon: pw.length > 0 && !COMMON_SET.has(pw.toLowerCase()),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

export const BRUTE_VULN_CODE: LocalizedCodeLine[] = [
  { text: "function login(username, password) {" },
  { text: "  const user = db.findUser(username);" },
  { text: "" },
  {
    text: "  // Tidak ada batas percobaan sama sekali.",
    highlight: "vuln",
  },
  {
    text: "  if (user && verify(password, user.hash)) {",
    highlight: "vuln",
    note: {
      id: "Penyerang bisa mencoba ribuan kata sandi tanpa hambatan. Tanpa penguncian atau jeda, brute-force hanya soal waktu.",
      en: "An attacker can try thousands of passwords unhindered. With no lockout or delay, brute-force is just a matter of time.",
    },
  },
  { text: "    return grantSession(user);" },
  { text: "  }" },
  { text: "  return reject();" },
  { text: "}" },
];

export const BRUTE_FIXED_CODE: LocalizedCodeLine[] = [
  { text: "function login(username, password) {" },
  { text: "  const user = db.findUser(username);" },
  { text: "" },
  {
    text: "  if (attempts(username) >= LIMIT) {",
    highlight: "safe",
    note: {
      id: "Hitung percobaan gagal per akun/IP. Setelah ambang batas terlampaui, kunci sementara sebelum penyerang menjangkau kata sandi benar.",
      en: "Count failed attempts per account/IP. Once the threshold is crossed, lock temporarily before the attacker reaches the right password.",
    },
  },
  {
    text: "    return lockout(); // + jeda / CAPTCHA / MFA",
    highlight: "safe",
  },
  { text: "  }" },
  { text: "" },
  { text: "  if (user && verify(password, user.hash)) {" },
  { text: "    return grantSession(user);" },
  { text: "  }" },
  { text: "  recordFailure(username);" },
  { text: "  return reject();" },
  { text: "}" },
];
