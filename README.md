<div align="center">

# OWASP Top 10 Interactive Playground

**Learn web security by breaking things, safely.**

An interactive education platform covering all 10 OWASP Top 10 (2021) vulnerabilities
through hands-on, client-side simulations. No real servers harmed.

[![Next.js](https://img.shields.io/badge/Next.js_14-000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## Why This Exists

Most OWASP learning resources are walls of text. This project takes a different approach:
you **run the exploit**, **watch it work**, then **prove the fix holds**, all inside
your browser with zero setup and zero risk.

**Key highlights:**

- 10 complete interactive modules with Vulnerable vs Fixed demos
- Client-side only: no vulnerable backend, no Docker, no setup headaches
- Bilingual (English / Indonesian) with instant language switching
- Animated visualizations: rainbow tables, brute-force meters, CVE scanners, attack streams

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Typography | Space Grotesk + JetBrains Mono (`next/font`) |
| i18n | Custom React Context, no external library |
| Deployment | Static export / Vercel |

---

## Getting Started

```bash
git clone https://github.com/Kurtz17/owasp-playground.git
cd owasp-playground
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start breaking things.

---

## CI/CD

Every push and pull request to `main` runs through GitHub Actions
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), which type-checks
the project and runs a production build. A red check means something broke
before it ever reaches deployment.

### Deploying to Vercel

This is a stock Next.js app, so Vercel needs zero configuration:

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Vercel auto-detects the Next.js framework, build command (`next build`),
   and output, just click **Deploy**.
3. Every push to `main` triggers a production deployment; every pull request
   gets its own preview URL automatically.

No environment variables or secrets are needed since every demo runs
in-memory in the browser.

---

## Module Coverage

All **10 categories** are fully implemented with bilingual theory and interactive demos.

| Code | Category | Demo Type |
|------|----------|-----------|
| A01 | Broken Access Control | IDOR: change account ID, leak another user's data |
| A02 | Cryptographic Failures | Animated rainbow table: MD5 without salt vs bcrypt |
| A03 | Injection | Two labs: SQL Injection login bypass & reflected XSS |
| A04 | Insecure Design | Business logic abuse: stack vouchers until total goes negative |
| A05 | Security Misconfiguration | Three labs: default creds, verbose errors, exposed files |
| A06 | Vulnerable Components | Animated CVE scanner: outdated deps vs patched versions |
| A07 | Auth Failures | Two labs: brute-force with lockout & password strength meter |
| A08 | Data Integrity Failures | Update installer: signature verification vs blind install |
| A09 | Logging & Monitoring | Animated attack stream: silent (no logs) vs triggered alerts |
| A10 | SSRF | URL fetcher: cloud metadata leak vs IP blocking + allowlist |

---

## Project Structure

```
app/
  layout.tsx                # Root layout + global providers
  page.tsx                  # Landing page (hero + module index)
  not-found.tsx             # 404 page
  module/[slug]/page.tsx    # Dynamic route per module (SSG)

components/
  AppShell.tsx              # Sidebar + mobile topbar shell
  Sidebar.tsx               # Collapsible navigation (10 modules)
  ModulePage.tsx            # Module template: Theory / Vulnerable / Fixed tabs
  ModuleIndex.tsx            # Module grid on landing
  LanguageProvider.tsx      # i18n context provider
  LanguageToggle.tsx        # EN/ID pill toggle
  Badges.tsx                # Difficulty, status, and time badges
  demo/                     # Reusable demo primitives
    CodeBlock.tsx            #   Syntax-highlighted code with line markers
    DemoConsole.tsx          #   Console-styled output area
    DemoLayout.tsx            #   Standard demo frame
  demos/                    # Interactive demos (A01 – A10)
    registry.tsx             #   Central component registry
  motion/                   # Animation utilities
    Reveal.tsx               #   Scroll-triggered fade-in
    CountUp.tsx               #   Animated number counter

lib/
  modules.ts                # Single source of truth for all 10 modules
  i18n.ts                   # i18n types and config (Lang, Localized<T>)
  demos/                    # Demo data and simulation logic (a01 – a10)
```

---

## How the Demo System Works

Each module follows a consistent three-layer architecture:

```
lib/demos/a0X.ts          Data + simulation logic (vulnerable & fixed functions)
        |
components/demos/A0X.tsx  UI that exports <Vulnerable /> and <Fixed />
        |
components/demos/registry.tsx  Maps module slug -> component pair
        |
components/ModulePage.tsx      Auto-resolves demo from registry by slug
```

**To add a new demo:**

1. Create `lib/demos/<code>.ts` with vulnerable and secure logic
2. Create `components/demos/<Code>.tsx` exporting `Vulnerable` and `Fixed`
3. Register in `components/demos/registry.tsx` with `key = module slug`

Modules without a registered demo gracefully fall back to a placeholder.

---

## Bilingual System

The i18n system is intentionally lightweight: a single React Context with no external dependencies.

- **Default language:** English
- **Persistence:** `localStorage` (survives page reload)
- **Toggle:** `[ EN | ID ]` pill in the sidebar and mobile topbar
- **Usage:** wrap translatable strings in `Localized<T>` = `{ en, id }`, resolve with `t(value)`

```tsx
const { t } = useLang();

return <h1>{t({ en: "Learn by doing", id: "Belajar sambil praktik" })}</h1>;
```

---

## License

MIT. Feel free to use this for learning, teaching, or building upon.

---

<div align="center">

**Built for education and portfolio purposes.**

Reference: [owasp.org/Top10](https://owasp.org/Top10/)

</div>
