/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium iOS-style colors
        'sura-dark': '#1c1c1e', 
        'sura-accent': '#0A84FF',
      }
    },
  },
  plugins: [],
}
