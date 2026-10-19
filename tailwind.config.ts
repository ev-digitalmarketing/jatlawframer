import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#153E6C",
        ink: "#0A2240",
        gold: { DEFAULT: "#C8A908", light: "#E2C84A" },
        ivory: "#F8F4E9",
      },
      fontFamily: {
        heading: ["var(--font-mont)", "sans-serif"],
        body: ["var(--font-open)", "sans-serif"],
      },
      boxShadow: {
        "3d": "0 24px 40px -18px rgba(5,18,36,.55), 0 2px 0 rgba(255,255,255,.18) inset",
      },
    },
  },
  plugins: [],
};
export default config;
