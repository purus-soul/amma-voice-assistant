/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amma: {
          green: "#059669",
          rose: "#E11D48",
          amber: "#D97706",
          bg: "#FFFBEB"
        }
      }
    },
  },
  plugins: [],
}
