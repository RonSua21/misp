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
        // Makati City official brand colors
        makati: {
          blue:       "#003DA5",  // primary brand blue
          "blue-dark":"#002B7A",
          "blue-mid": "#0052CC",
          "blue-light":"#E8F0FE",
          gold:       "#FFB81C",  // accent gold
          white:      "#FFFFFF",
          gray:       "#F5F7FA",
          "gray-dark":"#6B7280",
        },
        primary: {
          50:  "#E8F0FE",
          100: "#C4D5FC",
          200: "#9BBAF9",
          300: "#729FF6",
          400: "#4F8AF4",
          500: "#2B74F2",
          600: "#003DA5",   // main
          700: "#002B7A",
          800: "#001A4F",
          900: "#000A24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 61, 165, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 61, 165, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
