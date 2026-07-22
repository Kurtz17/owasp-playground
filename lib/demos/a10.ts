import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export type HostClass =
  | "metadata"
  | "loopback"
  | "private"
  | "external"
  | "invalid";

export interface FetchResponse {
  status: string;
  body: string;
  caption: Localized;
  sensitive: boolean;
}

const NETWORK: Record<string, FetchResponse> = {
  "169.254.169.254": {
    status: "200 OK",
    body: '{\n  "AccessKeyId": "ASIA5XK7EXAMPLE",\n  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",\n  "Token": "IQoJb3JpZ2luX2VjE...",\n  "Expiration": "2026-07-17T18:00:00Z"\n}',
    caption: {
      id: "Kredensial IAM dari metadata cloud. Dengan ini penyerang bisa menyamar sebagai server dan mengakses sumber daya cloud.",
      en: "IAM credentials from the cloud metadata service. With these an attacker can impersonate the server and access cloud resources.",
    },
    sensitive: true,
  },
  localhost: {
    status: "200 OK",
    body: "<h1>Panel Admin Internal</h1>\n<p>Status: semua layanan aktif</p>\n<a href='/hapus-semua'>Reset database</a>",
    caption: {
      id: "Panel admin internal yang seharusnya tidak bisa dijangkau dari luar.",
      en: "An internal admin panel that should be unreachable from outside.",
    },
    sensitive: true,
  },
  "127.0.0.1": {
    status: "200 OK",
    body: "<h1>Panel Admin Internal</h1>\n<p>Status: semua layanan aktif</p>",
    caption: {
      id: "Layanan yang berjalan di server itu sendiri (loopback).",
      en: "A service running on the server itself (loopback).",
    },
    sensitive: true,
  },
  "10.0.0.5": {
    status: "200 OK",
    body: "SERVICE billing-internal v2.3\nDB_HOST=10.0.0.9\nDB_PASS=r0tt3n-secret",
    caption: {
      id: "Layanan internal di jaringan privat, lengkap dengan rahasia konfigurasi.",
      en: "An internal service on the private network, complete with configuration secrets.",
    },
    sensitive: true,
  },
  "api.cuaca.example.com": {
    status: "200 OK",
    body: '{ "kota": "Jakarta", "suhu": 31, "kondisi": "berawan" }',
    caption: {
      id: "Layanan eksternal tepercaya. Inilah tujuan yang memang sah.",
      en: "A trusted external service. This is the legitimate destination.",
    },
    sensitive: false,
  },
};

export const ALLOWLIST = ["api.cuaca.example.com"];

export function parseHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function classifyHost(url: string): HostClass {
  const host = parseHost(url);
  if (host === null) return "invalid";
  if (host === "169.254.169.254") return "metadata";
  if (host === "localhost" || host === "127.0.0.1" || host.startsWith("127."))
    return "loopback";
  if (
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  )
    return "private";
  return "external";
}

export function isInternal(url: string): boolean {
  const c = classifyHost(url);
  return c === "metadata" || c === "loopback" || c === "private";
}

export type SsrfResult =
  | { kind: "ok"; host: string; response: FetchResponse }
  | { kind: "blocked"; host: string; reason: "internal" | "allowlist" }
  | { kind: "invalid" }
  | { kind: "unreachable"; host: string };

function lookup(host: string): FetchResponse | null {
  return NETWORK[host] ?? null;
}

export function fetchVulnerable(url: string): SsrfResult {
  const host = parseHost(url);
  if (host === null) return { kind: "invalid" };
  const response = lookup(host);
  if (!response) return { kind: "unreachable", host };
  return { kind: "ok", host, response };
}

export function fetchFixed(url: string): SsrfResult {
  const host = parseHost(url);
  if (host === null) return { kind: "invalid" };
  if (isInternal(url)) return { kind: "blocked", host, reason: "internal" };
  if (!ALLOWLIST.includes(host))
    return { kind: "blocked", host, reason: "allowlist" };
  const response = lookup(host);
  if (!response) return { kind: "unreachable", host };
  return { kind: "ok", host, response };
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "URL ke alamat internal", en: "URL to an internal address" },
    { id: "Di-fetch tanpa validasi", en: "Fetched without validation" },
    { id: "Metadata cloud bocor", en: "Cloud metadata leaks" },
  ],
  fixed: [
    { id: "URL ke alamat internal", en: "URL to an internal address" },
    { id: "IP internal diblokir", en: "Internal IP blocked" },
    { id: "Permintaan ditolak", en: "Request rejected" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "async function fetchPreview(url) {" },
  {
    text: {
      id: "  // URL dari pengguna langsung di-fetch server.",
      en: "  // The user's URL is fetched by the server directly.",
    },
    highlight: "vuln",
  },
  {
    text: "  const res = await fetch(url);",
    highlight: "vuln",
    note: {
      id: "Server mem-fetch URL apa pun tanpa memeriksa tujuannya. Penyerang bisa mengarahkannya ke 169.254.169.254 atau localhost untuk menjangkau layanan internal.",
      en: "The server fetches any URL without checking the destination. An attacker can point it at 169.254.169.254 or localhost to reach internal services.",
    },
  },
  { text: "  return await res.text();" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "async function fetchPreview(url) {" },
  { text: "  const host = new URL(url).hostname;" },
  { text: "" },
  {
    text: "  if (isInternal(host)) {",
    highlight: "safe",
    note: {
      id: "Tolak alamat internal: metadata cloud (169.254.169.254), loopback (127.0.0.1), dan rentang privat (10.x, 192.168.x, 172.16-31.x).",
      en: "Reject internal addresses: cloud metadata (169.254.169.254), loopback (127.0.0.1), and private ranges (10.x, 192.168.x, 172.16-31.x).",
    },
  },
  {
    text: {
      id: "    throw new Error('Host internal diblokir');",
      en: "    throw new Error('Internal host blocked');",
    },
  },
  { text: "  }" },
  {
    text: "  if (!allowlist.includes(host)) {",
    highlight: "safe",
    note: {
      id: "Lebih ketat lagi: hanya izinkan host yang memang ada di daftar tepercaya (allowlist).",
      en: "Stricter still: only allow hosts that are on the trusted list (an allowlist).",
    },
  },
  {
    text: {
      id: "    throw new Error('Host tidak diizinkan');",
      en: "    throw new Error('Host not allowed');",
    },
  },
  { text: "  }" },
  { text: "  return await (await fetch(url)).text();" },
  { text: "}" },
];
