/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "rgba(255,255,255,0.06)",
        accent: "#c6a667",
        accentMuted: "#e4d3a3",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
