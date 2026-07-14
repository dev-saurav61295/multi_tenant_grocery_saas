import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "#F3FCF1",
          green: "#006D37",
          greenBright: "#2ECC71",
          greenFixed: "#6BFE9C",
          orange: "#FC8F34",
          orangeDeep: "#944A00",
          ink: "#161D17",
          muted: "#3D4A3E",
          panel: "#FFFFFF",
          panelSoft: "#EEF6EB",
          panelAlt: "#E8F0E5",
          panelHigh: "#E2EBE0",
          panelHighest: "#DCE5DA",
          sidebar: "#2B322B",
          border: "#BBCBBB",
          outline: "#6C7B6D",
        },
      },
      boxShadow: {
        card: "0 4px 20px rgba(44, 62, 80, 0.05)",
        focus: "0 10px 30px rgba(44, 62, 80, 0.12)",
      },
      borderRadius: {
        panel: "0.75rem",
        shell: "1rem",
      },
    },
  },
};

export default config;