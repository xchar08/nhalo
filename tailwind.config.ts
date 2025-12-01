// ============================================================================
// FILE: tailwind.config.ts
// ============================================================================
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Domain-specific colors for graph and UI
        research: {
          DEFAULT: "#3b82f6", // blue-500
          light: "#93c5fd",
        },
        medical: {
          DEFAULT: "#10b981", // emerald-500
          light: "#6ee7b7",
        },
        political: {
          DEFAULT: "#f59e0b", // amber-500
          light: "#fcd34d",
        },
        mixed: {
          DEFAULT: "#8b5cf6", // violet-500
          light: "#c4b5fd",
        },
        // Specific functional colors
        unread: "#ff4d4d", // Red hue for unread nodes
      },
    },
  },
  plugins: [],
};

export default config;
