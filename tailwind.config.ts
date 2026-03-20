import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tools: {
          bg: "var(--tools-bg)",
          surface: "var(--tools-surface)",
          border: "var(--tools-border)",
          accent: "var(--tools-accent)",
          fg: "var(--tools-fg)",
          muted: "var(--tools-muted)",
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
