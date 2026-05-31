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
        primary: {
          DEFAULT: "#1A6B8A",
          dark: "#134E6B",
          light: "#2A8FAF",
          50: "#EBF6FA",
          100: "#C9E8F2",
        },
        secondary: {
          DEFAULT: "#17A589",
          dark: "#0E7B65",
          light: "#1FC8A5",
          50: "#E8F8F5",
        },
        accent: {
          DEFAULT: "#0D4F6B",
          dark: "#083B52",
          light: "#1A6B8A",
          50: "#E3F0F5",
        },
        dark: "#0A2535",
        surface: "#F4FAFB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0A2535 0%, #0D3347 50%, #134E6B 100%)",
        "card-gradient": "linear-gradient(135deg, #EBF6FA 0%, #E8F8F5 100%)",
        "brand-gradient": "linear-gradient(135deg, #1A6B8A 0%, #17A589 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
