import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-(emerald|teal|lime|green|blue|pink|violet|amber|orange|cyan|stone|fuchsia|indigo|gray|purple|sky|red|rose|slate|zinc)-(50|100|200|800)/,
    },
    {
      pattern: /text-(emerald|teal|lime|green|blue|pink|violet|amber|orange|cyan|stone|fuchsia|indigo|gray|purple|sky|red|rose|slate|zinc)-(700|800)/,
    },
    {
      pattern: /border-(emerald|teal|lime|green|blue|pink|violet|amber|orange|cyan|stone|fuchsia|indigo|gray|purple|sky|red|rose|slate|zinc)-(100|200|300|700)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "var(--notion-bg)",
          surface: "var(--notion-surface)",
          "surface-elevated": "var(--notion-surface-elevated)",
          hover: "var(--notion-hover)",
          border: "var(--notion-border)",
          text: "var(--notion-text)",
          muted: "var(--notion-muted)",
          accent: "var(--notion-accent)",
          "surface-hover": "var(--notion-surface-hover)",
          glow: "var(--notion-glow)",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
        modal: "0 20px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)",
        "glow-accent": "0 0 0 2px rgba(88,101,242,0.15)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "item-reveal": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease-out",
        "item-reveal": "item-reveal 0.25s cubic-bezier(0.4,0,0.2,1) both",
        "soft-fade": "soft-fade 0.3s ease both",
      },
      typography: {
        notion: {
          css: {
            "--tw-prose-body": "var(--notion-text)",
            "--tw-prose-headings": "var(--notion-text)",
            "--tw-prose-lead": "var(--notion-muted)",
            "--tw-prose-links": "var(--notion-accent)",
            "--tw-prose-bold": "var(--notion-text)",
            "--tw-prose-counters": "var(--notion-muted)",
            "--tw-prose-bullets": "var(--notion-muted)",
            "--tw-prose-hr": "var(--notion-border)",
            "--tw-prose-quotes": "var(--notion-text)",
            "--tw-prose-quote-borders": "var(--notion-border)",
            "--tw-prose-captions": "var(--notion-muted)",
            "--tw-prose-code": "var(--notion-text)",
            "--tw-prose-pre-code": "var(--notion-text)",
            "--tw-prose-pre-bg": "var(--notion-surface)",
            "--tw-prose-th-borders": "var(--notion-border)",
            "--tw-prose-td-borders": "var(--notion-border)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
export default config
