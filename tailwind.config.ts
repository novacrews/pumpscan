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
        bg: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          card: "#1a1a2e",
          hover: "#252540",
        },
        border: "#2a2a45",
        accent: {
          cyan: "#00f5ff",
          purple: "#bf00ff",
          pink: "#ff006e",
          green: "#00ff88",
          red: "#ff3355",
          yellow: "#ffcc00",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "SF Mono", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
