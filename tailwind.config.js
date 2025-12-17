/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7C3AED',
        'brand-purple-light': '#F5F3FF',
        'brand-gray': {
          100: '#F7F8FA',
          200: '#EFF1F6',
          300: '#E2E8F0',
          400: '#CBD5E1',
          500: '#64748B',
          600: '#475569'
        },
      },
    },
  },
  plugins: [],
}