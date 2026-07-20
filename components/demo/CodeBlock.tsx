import { Fragment } from "react";
import type { Lang, Localized } from "@/lib/i18n";

// Menampilkan potongan kode mono dengan penomoran baris, penyorotan baris
// ("vuln" merah / "safe" hijau), dan anotasi callout yang menunjuk langsung
// ke baris tertentu untuk menjelaskan letak kerentanan atau perbaikannya.
// Dipakai ulang oleh seluruh modul demo.

export type LineHighlight = "vuln" | "safe";

export interface CodeLine {
  text: string;
  highlight?: LineHighlight;
  // Callout yang muncul tepat di bawah baris ini.
  note?: string;
}

// Versi baris kode dengan anotasi dwibahasa (dipakai di data modul).
export interface LocalizedCodeLine extends Omit<CodeLine, "note"> {
  note?: Localized;
}

// Pilih versi bahasa untuk anotasi tiap baris kode.
export function localizeCode(
  lines: LocalizedCodeLine[],
  lang: Lang,
): CodeLine[] {
  return lines.map((line) => ({
    text: line.text,
    highlight: line.highlight,
    note: line.note ? line.note[lang] : undefined,
  }));
}

interface CodeBlockProps {
  // Nama file/judul yang tampil di header, mis. "server/account.ts"
  filename: string;
  lines: CodeLine[];
}

const HIGHLIGHT_STYLES: Record<
  LineHighlight,
  { row: string; marker: string; noteText: string; noteConnector: string }
> = {
  vuln: {
    row: "bg-ember/[0.08]",
    marker: "bg-ember",
    noteText: "text-ember",
    noteConnector: "text-ember/60",
  },
  safe: {
    row: "bg-mint/[0.08]",
    marker: "bg-mint",
    noteText: "text-mint",
    noteConnector: "text-mint/60",
  },
};

const NEUTRAL_NOTE = {
  noteText: "text-cream-dim",
  noteConnector: "text-cream-faint",
};

export function CodeBlock({ filename, lines }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#0A0A0D]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[12px] text-cream-faint">
          {filename}
        </span>
      </div>

      <div className="scrollbar-thin overflow-x-auto py-2">
        <div className="min-w-max font-mono text-[12.5px] leading-6">
          {lines.map((line, i) => {
            const style = line.highlight
              ? HIGHLIGHT_STYLES[line.highlight]
              : null;
            const noteStyle = style ?? NEUTRAL_NOTE;
            return (
              <Fragment key={i}>
                <div className={`flex ${style ? style.row : ""}`}>
                  <span
                    className={`w-0.5 shrink-0 ${style ? style.marker : "bg-transparent"}`}
                  />
                  <span className="w-10 shrink-0 select-none pl-3 pr-2 text-right text-cream-faint/50">
                    {i + 1}
                  </span>
                  <code className="whitespace-pre pr-5 text-cream-dim">
                    {line.text || " "}
                  </code>
                </div>

                {line.note && (
                  <div
                    className={`sticky left-0 flex max-w-[min(34rem,90vw)] items-start gap-2 py-1.5 pl-[3.25rem] pr-4 ${noteStyle.noteText}`}
                  >
                    <span
                      className={`select-none leading-5 ${noteStyle.noteConnector}`}
                      aria-hidden
                    >
                      &#9492;&#9472;&#9656;
                    </span>
                    <span className="text-[12px] leading-5">{line.note}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
