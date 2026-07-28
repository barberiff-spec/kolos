import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-deep": "rgb(var(--accent-deep) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        inverse: "rgb(var(--inverse) / <alpha-value>)",
        "on-inverse": "rgb(var(--on-inverse) / <alpha-value>)",
        charcoal: "rgb(var(--charcoal) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-strong": "rgb(var(--danger-strong) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        inverse: "var(--shadow-inverse)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;