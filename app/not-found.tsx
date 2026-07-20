"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="grid min-h-[75vh] place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[90px] font-medium leading-none text-cream/10">
          404
        </p>
        <h1 className="mt-6 text-[24px] font-semibold tracking-tight text-cream">
          {t({
            id: "Halaman ini tidak ditemukan.",
            en: "This page could not be found.",
          })}
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-cream-dim">
          {t({
            id: "Rute yang kamu tuju tidak ada di indeks modul, atau sudah dipindahkan.",
            en: "The route you're looking for isn't in the module index, or it has moved.",
          })}
        </p>
        <Link
          href="/"
          className="mt-10 inline-block rounded-full bg-ember px-8 py-3.5 text-[14px] font-medium text-night transition hover:bg-ember-bright"
        >
          {t({ id: "Kembali ke indeks", en: "Back to the index" })}
        </Link>
      </div>
    </div>
  );
}
