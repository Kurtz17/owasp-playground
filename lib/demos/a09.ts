import type { LocalizedCodeLine } from "@/components/demo/CodeBlock";
import type { Localized } from "../i18n";

export type EventLevel = "warn" | "crit";

export interface SecurityEvent {
  time: string;
  ip: string;
  action: Localized;
  level: EventLevel;
}

export const EVENTS: SecurityEvent[] = [
  {
    time: "02:14:03",
    ip: "203.0.113.7",
    action: { id: "Login gagal · admin", en: "Failed login · admin" },
    level: "warn",
  },
  {
    time: "02:14:07",
    ip: "203.0.113.9",
    action: { id: "Login gagal · admin", en: "Failed login · admin" },
    level: "warn",
  },
  {
    time: "02:14:11",
    ip: "45.83.12.4",
    action: { id: "Login gagal · admin", en: "Failed login · admin" },
    level: "warn",
  },
  {
    time: "02:14:15",
    ip: "45.83.12.9",
    action: { id: "Login gagal · admin", en: "Failed login · admin" },
    level: "warn",
  },
  {
    time: "02:14:18",
    ip: "198.51.100.2",
    action: { id: "Login gagal · admin", en: "Failed login · admin" },
    level: "warn",
  },
  {
    time: "02:14:22",
    ip: "198.51.100.2",
    action: { id: "Login BERHASIL · admin", en: "Login SUCCESS · admin" },
    level: "crit",
  },
  {
    time: "02:15:40",
    ip: "198.51.100.2",
    action: { id: "Ekspor tabel pengguna", en: "Export users table" },
    level: "crit",
  },
];

export const ALERT_THRESHOLD = 5;

export interface Detection {
  detected: boolean;
  alertIndex: number | null;
  logged: number;
}

export function detectVulnerable(): Detection {
  return { detected: false, alertIndex: null, logged: 0 };
}

export function detectFixed(): Detection {
  let failures = 0;
  let alertIndex: number | null = null;
  EVENTS.forEach((e, i) => {
    if (e.level === "warn") {
      failures += 1;
      if (failures >= ALERT_THRESHOLD && alertIndex === null) {
        alertIndex = i;
      }
    }
  });
  return {
    detected: alertIndex !== null,
    alertIndex,
    logged: EVENTS.length,
  };
}

export const FLOW: Record<"vuln" | "fixed", Localized[]> = {
  vuln: [
    { id: "Serangan berjalan", en: "Attack runs" },
    { id: "Tak ada log / alert", en: "No logs / alerts" },
    { id: "Lolos tanpa ketahuan", en: "Goes unnoticed" },
  ],
  fixed: [
    { id: "Serangan berjalan", en: "Attack runs" },
    { id: "Dicatat + aturan alert", en: "Logged + alert rule" },
    { id: "Terdeteksi & direspons", en: "Detected & responded" },
  ],
};

export const VULN_CODE: LocalizedCodeLine[] = [
  { text: "function handleLogin(req, ok) {" },
  { text: "  if (!ok) {" },
  {
    text: {
      id: "    // Kegagalan tidak dicatat, tidak ada yang memantau.",
      en: "    // The failure isn't logged, nobody is watching.",
    },
    highlight: "vuln",
  },
  {
    text: "    return reject();",
    highlight: "vuln",
    note: {
      id: "Tanpa log dan tanpa alert, ribuan percobaan login bisa berlalu tanpa jejak. Serangan baru ketahuan jauh setelah kerusakan terjadi, kalau ketahuan sama sekali.",
      en: "With no logs and no alerts, thousands of login attempts can pass without a trace. The attack is only noticed long after the damage is done, if at all.",
    },
  },
  { text: "  }" },
  { text: "}" },
];

export const FIXED_CODE: LocalizedCodeLine[] = [
  { text: "function handleLogin(req, ok) {" },
  { text: "  if (!ok) {" },
  {
    text: "    logger.warn('login_failed', { ip: req.ip, user });",
    highlight: "safe",
    note: {
      id: "Catat setiap kejadian penting dengan konteks yang cukup (siapa, dari mana, kapan) tanpa membocorkan data sensitif.",
      en: "Log every significant event with enough context (who, from where, when) without leaking sensitive data.",
    },
  },
  {
    text: "    if (failedFrom(req.ip) >= LIMIT) {",
    highlight: "safe",
  },
  {
    text: "      alert.trigger('brute_force', req.ip);",
    highlight: "safe",
    note: {
      id: "Aturan alerting mengubah log menjadi tindakan: begitu ambang terlampaui, tim keamanan langsung diberi tahu untuk merespons.",
      en: "An alerting rule turns logs into action: once the threshold is crossed, the security team is notified immediately to respond.",
    },
  },
  { text: "    }" },
  { text: "    return reject();" },
  { text: "  }" },
  { text: "}" },
];
