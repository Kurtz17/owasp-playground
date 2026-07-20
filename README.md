# OWASP Top 10 Interactive Playground

An interactive web security education platform for learning the **OWASP Top 10 (2021)** vulnerabilities through hands-on, client-side simulations. All demos run **entirely in the browser** — no real vulnerable backend involved. Built for education & portfolio purposes. Bilingual support (English / Indonesian).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- Font: Space Grotesk + JetBrains Mono via `next/font`
- Bilingual (English / Indonesian) via lightweight context-based i18n — no external library

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Project Structure

```
app/
  layout.tsx              # Root layout + AppShell (sidebar)
  page.tsx                # Landing: hero, info, 10-module grid
  not-found.tsx           # 404 page
  module/[slug]/page.tsx  # Dynamic route for each module (SSG)
components/
  AppShell.tsx            # Shell: sidebar + mobile topbar
  Sidebar.tsx             # 10-category navigation (collapsible + responsive)
  ModuleIndex.tsx         # Module index grid on landing
  ModulePage.tsx          # Module template: Theory / Vulnerable / Fixed tabs
  Badges.tsx              # Difficulty level, status, and time badges
  LanguageProvider.tsx    # i18n context provider
  LanguageToggle.tsx      # EN/ID language switch
  demo/                   # Reusable demo UI primitives
  demos/                  # Interactive demo components (A01–A10)
  motion/                 # Animation components (Reveal, CountUp)
lib/
  modules.ts             # Single source of truth for all 10 modules
  i18n.ts                # i18n types and configuration
  demos/                 # Demo data and logic (a01–a10)
```

## Adding / Editing Modules

All metadata (code, slug, name, description, difficulty, status, theory) lives in
[`lib/modules.ts`](lib/modules.ts). The sidebar, landing page, and routing all read
from this single file.

Change `status: "segera-hadir"` to `"tersedia"` when a module's content is ready.

## Module Status

All **10 modules are complete** — full bilingual theory + interactive Vulnerable &
Fixed demos with annotated code panels and attack flow strips.

- **A01 Broken Access Control** — IDOR demo (change account ID → another user's data leaks).
- **A02 Cryptographic Failures** — Animated rainbow table (MD5 without salt vs bcrypt) with real MD5 hashes.
- **A03 Injection** — Two labs (SQL Injection login bypass & XSS) with sub-toggles and payload chips.
- **A04 Insecure Design** — Business logic abuse (stacking vouchers until total goes negative) vs threat-modeled flow.
- **A05 Security Misconfiguration** — Three labs (default credentials, verbose errors, exposed sensitive files).
- **A06 Vulnerable & Outdated Components** — Animated CVE scanner (outdated dependencies vs patched versions).
- **A07 Auth Failures** — Two labs (animated brute-force with lockout & password strength meter).
- **A08 Software & Data Integrity Failures** — Update installer (signature verification vs installing without checks).
- **A09 Security Logging & Monitoring Failures** — Animated attack stream (silent with no logs vs triggered alerts).
- **A10 SSRF** — URL fetcher (cloud metadata & internal services vs internal IP blocking + allowlist).

## Adding Interactive Demos

Reusable demo components live in [`components/demo/`](components/demo/):

- `CodeBlock` — Monospace code with highlighted lines (red = vulnerable, green = secure)
- `DemoConsole` + `DataRow` — Console-styled output area
- `DemoLayout` — Standard frame for each demo tab

Steps to add a new module demo (following the A01 pattern):

1. Create data + logic in `lib/demos/<code>.ts` (vulnerable & secure version functions).
2. Create component in `components/demos/<Code>.tsx` exporting `Vulnerable` and `Fixed`.
3. Register in [`components/demos/registry.tsx`](components/demos/registry.tsx) with key = module slug.

`ModulePage` automatically picks up demos from the registry; modules without a registered demo show a placeholder.

## Bilingual (i18n)

Language is stored in context ([`components/LanguageProvider.tsx`](components/LanguageProvider.tsx))
and persisted via `localStorage`. The `[ EN | ID ]` toggle is in the sidebar and
mobile topbar. Translatable content uses the `Localized<T>` type = `{ id, en }`
([`lib/i18n.ts`](lib/i18n.ts)); retrieve the active version with `t(value)` from
`useLang()`. When adding new modules/demos, write text as `{ id, en }`.

Default language is **English**. Users can switch to Indonesian at any time via the language toggle.
