import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODULES, getModuleBySlug } from "@/lib/modules";
import { ModulePage } from "@/components/ModulePage";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const m = getModuleBySlug(params.slug);
  if (!m) return { title: "Modul tidak ditemukan" };
  return {
    title: `${m.code} · ${m.name}`,
    description: m.description.id,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const m = getModuleBySlug(params.slug);
  if (!m) notFound();
  return <ModulePage module={m} />;
}
