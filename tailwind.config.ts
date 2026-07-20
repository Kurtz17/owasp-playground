import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charcoal editorial
        night: {
          DEFAULT: "#0E0E11",
          raised: "#141318",
          high: "#1B1A20",
        },
        line: {
          DEFAULT: "#26242C",
          soft: "#1C1B22",
        },
        cream: {
          DEFAULT: "#EDEAE3",
          dim: "#A9A69C",
          faint: "#6B6963",
        },
        // Aksen tunggal: merah-oranye "ember" (identitas: red team / serangan)
        ember: {
          DEFAULT: "#FF5638",
          bright: "#FF7B5F",
          dim: "#8C3220",
        },
        // Hijau mint hanya untuk semantik "aman/fixed"
        mint: {
          DEFAULT: "#3ECF8E",
          dim: "#20654A",
        },
        gold: {
          DEFAULT: "#E8B04B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderColor: {
        DEFAULT: "#26242C",
      },
      maxWidth: {
        prose: "42rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "flash-vuln": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,86,56,0.0)" },
          "30%": { boxShadow: "0 0 0 4px rgba(255,86,56,0.25)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,86,56,0.0)" },
        },
        "flash-safe": {
          "0%": { boxShadow: "0 0 0 0 rgba(62,207,142,0.0)" },
          "30%": { boxShadow: "0 0 0 4px rgba(62,207,142,0.22)" },
          "100%": { boxShadow: "0 0 0 0 rgba(62,207,142,0.0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "flash-vuln": "flash-vuln 0.9s ease-out",
        "flash-safe": "flash-safe 0.9s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
