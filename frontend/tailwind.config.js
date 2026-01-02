/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-blue-100',
    'text-blue-800',
    'bg-red-100',
    'text-red-800',
    'bg-purple-100',
    'text-purple-800',
    'bg-amber-100',
    'text-amber-800',
    'bg-green-100',
    'text-green-800',
    'bg-gray-100',
    'text-gray-800'
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}