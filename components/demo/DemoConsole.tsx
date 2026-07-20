export type ConsoleTone = "vuln" | "safe" | "netral";

interface DemoConsoleProps {
  request?: string;
  tone?: ConsoleTone;
  status?: string;

  children: React.ReactNode;
}

const TONE_STYLES: Record<ConsoleTone, string> = {
  vuln: "text-ember",
  safe: "text-mint",
  netral: "text-cream-dim",
};

export function DemoConsole({
  request,
  tone = "netral",
  status,
  children,
}: DemoConsoleProps) {
  const flash =
    tone === "vuln"
      ? "animate-flash-vuln"
      : tone === "safe"
        ? "animate-flash-safe"
        : "";
  return (
    <div
      className={`animate-fade-up overflow-hidden rounded-xl border border-line bg-[#0A0A0D] ${flash}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="truncate font-mono text-[12px] text-cream-faint">
          {request ?? "output"}
        </span>
        {status && (
          <span
            className={`shrink-0 font-mono text-[11px] font-medium ${TONE_STYLES[tone]}`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

export function DataRow({
  label,
  value,
  sensitive,
}: {
  label: string;
  value: string;
  sensitive?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-soft py-2 last:border-b-0">
      <span className="font-mono text-[12px] uppercase tracking-wide text-cream-faint">
        {label}
      </span>
      <span
        className={`text-right font-mono text-[13px] ${
          sensitive ? "text-ember" : "text-cream"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
