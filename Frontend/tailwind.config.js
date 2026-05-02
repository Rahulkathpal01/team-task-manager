/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Display: sharp, industrial mono for headings
        mono: ["'JetBrains Mono'", "monospace"],
        // Body: clean humanist sans
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        // Core palette — deep charcoal + amber
        canvas:  "#0f0f0f",
        surface: "#1a1a1a",
        border:  "#2a2a2a",
        muted:   "#404040",
        dim:     "#6b6b6b",
        text:    "#e8e8e8",
        amber: {
          DEFAULT: "#f59e0b",
          dim:     "#92400e",
          glow:    "#fbbf24",
        },
        danger:  "#ef4444",
        success: "#22c55e",
        info:    "#3b82f6",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0)" },
          "50%":       { boxShadow: "0 0 0 4px rgba(245,158,11,0.15)" },
        },
      },
      animation: {
        "fade-up":     "fade-up 0.4s ease both",
        "pulse-amber": "pulse-amber 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};