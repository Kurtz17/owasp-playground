import type { ComponentType } from "react";
import { A01Fixed, A01Vulnerable } from "./A01";
import { A02Fixed, A02Vulnerable } from "./A02";
import { A04Fixed, A04Vulnerable } from "./A04";
import { A03Fixed, A03Vulnerable } from "./A03";
import { A05Fixed, A05Vulnerable } from "./A05";
import { A06Fixed, A06Vulnerable } from "./A06";
import { A07Fixed, A07Vulnerable } from "./A07";
import { A08Fixed, A08Vulnerable } from "./A08";
import { A09Fixed, A09Vulnerable } from "./A09";
import { A10Fixed, A10Vulnerable } from "./A10";

interface DemoEntry {
  Vulnerable: ComponentType;
  Fixed: ComponentType;
}

const DEMO_REGISTRY: Record<string, DemoEntry> = {
  "broken-access-control": {
    Vulnerable: A01Vulnerable,
    Fixed: A01Fixed,
  },
  "cryptographic-failures": {
    Vulnerable: A02Vulnerable,
    Fixed: A02Fixed,
  },
  injection: {
    Vulnerable: A03Vulnerable,
    Fixed: A03Fixed,
  },
  "insecure-design": {
    Vulnerable: A04Vulnerable,
    Fixed: A04Fixed,
  },
  "security-misconfiguration": {
    Vulnerable: A05Vulnerable,
    Fixed: A05Fixed,
  },
  "vulnerable-outdated-components": {
    Vulnerable: A06Vulnerable,
    Fixed: A06Fixed,
  },
  "identification-authentication-failures": {
    Vulnerable: A07Vulnerable,
    Fixed: A07Fixed,
  },
  "software-data-integrity-failures": {
    Vulnerable: A08Vulnerable,
    Fixed: A08Fixed,
  },
  "security-logging-monitoring-failures": {
    Vulnerable: A09Vulnerable,
    Fixed: A09Fixed,
  },
  ssrf: {
    Vulnerable: A10Vulnerable,
    Fixed: A10Fixed,
  },
};

export function getDemo(slug: string): DemoEntry | null {
  return DEMO_REGISTRY[slug] ?? null;
}
