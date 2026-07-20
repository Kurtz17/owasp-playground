export function Field({
  label,
  value,
  onChange,
  mono,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
  type?: "text" | "password";
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-line bg-night-raised px-3 py-2.5 text-[14px] text-cream outline-none transition placeholder:text-cream-faint focus:border-cream-faint ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
