import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export type PackageSource = "official" | "tampered";

export interface UpdatePackage {
  source: PackageSource;
  version: string;
  payload: string;
  malicious: boolean;
  signature: string;
}

export function sign(payload: string): string {
  let h = 5381;
  for (let i = 0; i < payload.length; i++) {
    h = ((h << 5) + h + payload.charCodeAt(i)) >>> 0;
  }
  return "sig_" + h.toString(16);
}

const LEGIT_PAYLOAD = "core.js · ui.js · api.js (build resmi v2.4.0)";
const EVIL_PAYLOAD = "core.js · ui.js · api.js · backdoor.js (curi token sesi)";

export const TRUSTED_SIGNATURE = sign(LEGIT_PAYLOAD);

export const OFFICIAL_PACKAGE: UpdatePackage = {
  source: "official",
  version: "2.4.0",
  payload: LEGIT_PAYLOAD,
  malicious: false,
  signature: TRUSTED_SIGNATURE,
};

export const TAMPERED_PACKAGE: UpdatePackage = {
  source: "tampered",
  version: "2.4.0",
  payload: EVIL_PAYLOAD,
  malicious: true,
  signature: TRUSTED_SIGNATURE,
};

export function getPackage(source: PackageSource): UpdatePackage {
  return source === "official" ? OFFICIAL_PACKAGE : TAMPERED_PACKAGE;
}

export function verifySignature(pkg: UpdatePackage): boolean {
  return sign(pkg.payload) === pkg.signature;
}

export type InstallResult =
  | { kind: "installed"; malicious: boolean }
  | { kind: "rejected" };

export function installVulnerable(pkg: UpdatePackage): InstallResult {
  return { kind: "installed", malicious: pkg.malicious };
}

export function installFixed(pkg: UpdatePackage): InstallResult {
  if (!verifySignature(pkg)) return { kind: "rejected" };
  return { kind: "installed", malicious: pkg.malicious };
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Unduh paket update", en: "Download update package" },
    { id: "Dipasang tanpa verifikasi", en: "Installed without verifying" },
    { id: "Backdoor ikut terpasang", en: "Backdoor gets installed" },
  ],
  fixed: [
    { id: "Unduh paket update", en: "Download update package" },
    { id: "Verifikasi tanda tangan", en: "Verify the signature" },
    { id: "Paket palsu ditolak", en: "Forged package rejected" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "async function installUpdate(pkg) {" },
  {
    text: {
      id: "  // Langsung pasang, apa pun isinya.",
      en: "  // Install right away, whatever the contents.",
    },
    highlight: "vuln",
  },
  {
    text: "  await install(pkg.payload);",
    highlight: "vuln",
    note: {
      id: "Paket dipasang tanpa memeriksa tanda tangannya. Kalau isinya disusupi di tengah jalan (mis. mirror palsu), kode jahat ikut terpasang.",
      en: "The package is installed without checking its signature. If the contents were tampered in transit (e.g. a fake mirror), malicious code is installed too.",
    },
  },
  { text: "  return 'ok';" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "async function installUpdate(pkg) {" },
  {
    text: "  if (!verify(pkg.payload, pkg.signature, TRUSTED_KEY)) {",
    highlight: "safe",
    note: {
      id: "Verifikasi tanda tangan terhadap kunci publik penerbit yang tepercaya. Isi yang diubah tidak akan cocok dengan tanda tangannya.",
      en: "Verify the signature against the trusted publisher's public key. Tampered contents won't match their signature.",
    },
  },
  {
    text: {
      id: "    throw new Error('Tanda tangan tidak valid');",
      en: "    throw new Error('Invalid signature');",
    },
    highlight: "safe",
  },
  { text: "  }" },
  { text: "  await install(pkg.payload);" },
  { text: "  return 'ok';" },
  { text: "}" },
];
