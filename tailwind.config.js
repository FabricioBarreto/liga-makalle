/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        club: {
          celeste: "#38BDF8",
          "celeste-dark": "#0EA5E9",
          "celeste-deep": "#0369A1",
          white: "#F0F9FF",
          dark: "#060E1A",
          "dark-2": "#0D1B2E",
          "dark-3": "#122040",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
