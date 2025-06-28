/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green': '#00A19C',
        'green-light': '#00C4B4',
        'orange': {
          400: '#fb923c',
          500: '#f97316',
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      backdropBlur: {
        'xl': '24px',
      },
      letterSpacing: {
        'wider': '0.05em',
        'widest': '0.1em',
      }
    },
  },
  plugins: [],
} 