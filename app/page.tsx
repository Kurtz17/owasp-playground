"use client";

import Link from "next/link";
import { MODULES, getAvailableModules } from "@/lib/modules";
import { ModuleIndex } from "@/components/ModuleIndex";
import { Reveal } from "@/components/motion/Reveal";
import { useLang } from "@/components/LanguageProvider";
import type { Localized } from "@/lib/i18n";

const PRINCIPLES: { no: string; title: Localized; body: Localized }[] = [
  {
    no: "01",
    title: { id: "Apa itu OWASP Top 10?", en: "What is the OWASP Top 10?" },
    body: {
      id: "Daftar sepuluh risiko keamanan aplikasi web paling kritis, disusun dari data ribuan aplikasi nyata. Jadi acuan standar developer dan pentester di seluruh dunia.",
      en: "A list of the ten most critical web application security risks, built from data across thousands of real applications. It's the standard reference for developers and pentesters worldwide.",
    },
  },
  {
    no: "02",
    title: { id: "Belajar sambil praktik", en: "Learn by doing" },
    body: {
      id: "Teori yang cuma dibaca gampang menguap. Di sini kamu memasukkan payload, melihat langsung serangannya bekerja, lalu membuktikan sendiri kenapa versi perbaikannya kebal.",
      en: "Theory you only read fades fast. Here you enter the payload, watch the exploit work, then prove for yourself why the fixed version holds up.",
    },
  },
  {
    no: "03",
    title: { id: "Ruang aman, bukan target", en: "A sandbox, not a target" },
    body: {
      id: "Tidak ada backend rentan sungguhan. Semua simulasi berjalan langsung di browser, jadi kamu bebas bereksperimen tanpa risiko apa pun.",
      en: "There's no real vulnerable backend. Every simulation runs client-side, so you're free to experiment with zero risk.",
    },
  },
];

export default function HomePage() {
  const { t } = useLang();
  const total = MODULES.length;
  const available = getAvailableModules().length;

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-12">
      <section className="pb-16 pt-20 md:pb-24 md:pt-32">
        <p className="eyebrow animate-fade-up">
          {t({
            id: "Edukasi keamanan web · Bahasa Indonesia",
            en: "Web security education · Interactive",
          })}
        </p>

        <h1
          className="mt-8 max-w-3xl animate-fade-up text-[38px] font-semibold leading-[1.12] tracking-tight text-cream md:text-[54px]"
          style={{ animationDelay: "80ms" }}
        >
          {t({
            id: "Sepuluh kerentanan web paling kritis. Pelajari dengan ",
            en: "The ten most critical web vulnerabilities. Learn them by ",
          })}
          <span className="text-ember">
            {t({ id: "membobolnya", en: "breaking them" })}
          </span>
          .
        </h1>

        <p
          className="mt-8 max-w-prose animate-fade-up text-[16px] leading-8 text-cream-dim"
          style={{ animationDelay: "160ms" }}
        >
          {t({
            id: "Playground interaktif untuk OWASP Top 10. Coba sendiri serangannya, pahami kenapa bisa berhasil, lalu bandingkan dengan versi yang sudah diperbaiki. Semuanya berjalan aman di dalam browser, tanpa ada server sungguhan yang jadi korban.",
            en: "An interactive playground for the OWASP Top 10. Run the attacks yourself, understand why they work, then compare against the patched version. Everything runs safely inside your browser, with no real server harmed.",
          })}
        </p>

        <div
          className="mt-12 flex animate-fade-up flex-wrap items-center gap-x-8 gap-y-4"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/module/broken-access-control"
            className="rounded-full bg-ember px-8 py-3.5 text-[14px] font-medium text-night transition hover:bg-ember-bright active:scale-95"
          >
            {t({ id: "Mulai belajar", en: "Start learning" })}
          </Link>
          <a
            href="#indeks"
            className="group text-[14px] text-cream-dim transition hover:text-cream"
          >
            {t({ id: "Lihat indeks modul", en: "See the module index" })}{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </section>



      <section className="grid gap-12 border-t border-line py-16 md:grid-cols-3 md:gap-10 md:py-20">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.no} delay={i * 90}>
            <span className="font-mono text-[13px] text-ember">{p.no}</span>
            <h3 className="mt-4 text-[19px] font-semibold leading-snug tracking-tight text-cream">
              {t(p.title)}
            </h3>
            <p className="mt-3 text-[14.5px] leading-7 text-cream-dim">
              {t(p.body)}
            </p>
          </Reveal>
        ))}
      </section>

      <section id="indeks" className="scroll-mt-10 pb-8 pt-16 md:pt-20">
        <Reveal className="mb-10 flex items-baseline justify-between gap-6">
          <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-4xl">
            {t({ id: "Indeks", en: "Index" })}
          </h2>
          <span className="eyebrow">
            {t({
              id: `${available} dari ${total} tersedia`,
              en: `${available} of ${total} available`,
            })}
          </span>
        </Reveal>

        <ModuleIndex modules={MODULES} />
      </section>

      <footer className="flex flex-wrap items-baseline justify-between gap-4 py-14">
        <p className="text-[13px] text-cream-faint">
          {t({
            id: "Dibuat untuk edukasi & portfolio.",
            en: "Built for education & portfolio.",
          })}
        </p>
        <p className="text-[13px] text-cream-faint">
          {t({ id: "Referensi", en: "Reference" })}:{" "}
          <span className="text-cream-dim">owasp.org/Top10</span>
        </p>
      </footer>
    </div>
  );
}
