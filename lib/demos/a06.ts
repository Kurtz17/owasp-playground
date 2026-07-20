// Demo A06 Vulnerable & Outdated Components: scanner CVE untuk dependency
// package.json (usang vs tertambal). Database CVE in-memory.

import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export type Severity = "kritis" | "tinggi" | "sedang";

export interface CveEntry {
  id: string;
  // Rentang versi yang terdampak: semua versi < fixedIn.
  fixedIn: string;
  severity: Severity;
  summary: Localized;
}

// Database CVE sederhana, dikunci per nama paket.
export const CVE_DB: Record<string, CveEntry[]> = {
  lodash: [
    {
      id: "CVE-2021-23337",
      fixedIn: "4.17.21",
      severity: "tinggi",
      summary: {
        id: "Command injection lewat template pada versi lawas.",
        en: "Command injection via template in older versions.",
      },
    },
  ],
  express: [
    {
      id: "CVE-2022-24999",
      fixedIn: "4.17.3",
      severity: "sedang",
      summary: {
        id: "Denial of service akibat parsing query yang cacat.",
        en: "Denial of service from malformed query parsing.",
      },
    },
  ],
  "next": [
    {
      id: "CVE-2025-XXXX",
      fixedIn: "14.2.35",
      severity: "kritis",
      summary: {
        id: "Kerentanan pada penanganan permintaan yang bisa dieksploitasi.",
        en: "An exploitable flaw in request handling.",
      },
    },
  ],
  axios: [
    {
      id: "CVE-2023-45857",
      fixedIn: "1.6.0",
      severity: "tinggi",
      summary: {
        id: "Kebocoran kredensial saat mengikuti redirect lintas-domain.",
        en: "Credential leakage when following cross-origin redirects.",
      },
    },
  ],
  jsonwebtoken: [
    {
      id: "CVE-2022-23529",
      fixedIn: "9.0.0",
      severity: "kritis",
      summary: {
        id: "Verifikasi token bisa dilewati sehingga token palsu diterima.",
        en: "Token verification can be bypassed, accepting forged tokens.",
      },
    },
  ],
};

export interface Dependency {
  name: string;
  version: string;
}

// package.json versi rentan (dependency usang).
export const DEPS_VULN: Dependency[] = [
  { name: "next", version: "14.2.5" },
  { name: "express", version: "4.17.1" },
  { name: "lodash", version: "4.17.20" },
  { name: "axios", version: "0.21.1" },
  { name: "jsonwebtoken", version: "8.5.1" },
  { name: "react", version: "18.3.1" },
];

// package.json versi aman (semua sudah di-update melewati fixedIn).
export const DEPS_FIXED: Dependency[] = [
  { name: "next", version: "14.2.35" },
  { name: "express", version: "4.19.2" },
  { name: "lodash", version: "4.17.21" },
  { name: "axios", version: "1.7.4" },
  { name: "jsonwebtoken", version: "9.0.2" },
  { name: "react", version: "18.3.1" },
];

// Membandingkan dua versi semver sederhana (mayor.minor.patch).
// Mengembalikan true jika `a` lebih kecil dari `b`.
export function isVersionLessThan(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da < db) return true;
    if (da > db) return false;
  }
  return false;
}

export interface ScanRow {
  dep: Dependency;
  // CVE yang berlaku untuk versi ini (kosong = aman).
  matches: CveEntry[];
}

// Memindai daftar dependency terhadap database CVE.
export function scan(deps: Dependency[]): ScanRow[] {
  return deps.map((dep) => {
    const known = CVE_DB[dep.name] ?? [];
    const matches = known.filter((cve) =>
      isVersionLessThan(dep.version, cve.fixedIn),
    );
    return { dep, matches };
  });
}

export function countVulnerable(rows: ScanRow[]): number {
  return rows.filter((r) => r.matches.length > 0).length;
}

export const SEVERITY_META: Record<
  Severity,
  { label: Localized; className: string }
> = {
  kritis: {
    label: { id: "KRITIS", en: "CRITICAL" },
    className: "border-ember/50 text-ember",
  },
  tinggi: {
    label: { id: "TINGGI", en: "HIGH" },
    className: "border-ember/40 text-ember",
  },
  sedang: {
    label: { id: "SEDANG", en: "MEDIUM" },
    className: "border-gold/50 text-gold",
  },
};

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Pakai dependency usang", en: "Use outdated dependency" },
    { id: "Punya CVE yang diketahui", en: "Has a known CVE" },
    { id: "Aplikasi ikut rentan", en: "App inherits the flaw" },
  ],
  fixed: [
    { id: "Perbarui ke versi tertambal", en: "Update to patched version" },
    { id: "CVE sudah tertutup", en: "CVE is closed" },
    { id: "Tak ada temuan", en: "No findings" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "// package.json" },
  { text: '"dependencies": {' },
  {
    text: '  "axios": "0.21.1",',
    highlight: "vuln",
    note: {
      id: "Versi lawas dengan CVE yang sudah publik. Selama tidak diperbarui, kelemahannya ikut terbawa ke aplikasimu.",
      en: "An old version with a public CVE. As long as it isn't updated, the flaw is inherited by your app.",
    },
  },
  { text: '  "jsonwebtoken": "8.5.1",', highlight: "vuln" },
  { text: '  "lodash": "4.17.20"' },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "// package.json" },
  { text: '"dependencies": {' },
  {
    text: '  "axios": "1.7.4",',
    highlight: "safe",
    note: {
      id: "Diperbarui melewati versi yang ditambal. Pindai dependency secara rutin (mis. npm audit, Dependabot) agar versi rentan cepat ketahuan.",
      en: "Updated past the patched version. Scan dependencies regularly (e.g. npm audit, Dependabot) so vulnerable versions surface fast.",
    },
  },
  { text: '  "jsonwebtoken": "9.0.2",', highlight: "safe" },
  { text: '  "lodash": "4.17.21"' },
  { text: "}" },
];
