/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinematic: '#050314', // Very deep violet/black background
        glass: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        primary: '#6366f1', // Indigo
        accent: '#d946ef', // Magenta/pink
      }
    },
  },
  plugins: [],
}