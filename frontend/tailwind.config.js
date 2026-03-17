/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paiva-marinho': '#001F3F',
        'paiva-laranja': '#FF8C00',
      },
    },
  },
  plugins: [],
}