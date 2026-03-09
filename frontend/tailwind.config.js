/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      colors: {
        primary: "#1B4332",
        accent: "#D97706",
        "background-light": "#F9F5F0",
        "background-dark": "#151d1a",
        "surface-light": "#ffffff",
      },
    },
  },
  plugins: [],
}
