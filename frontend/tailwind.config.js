/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#090B0E",
          800: "#11141B",
          700: "#1A1E29",
          600: "#252B3B",
          500: "#343D52"
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          900: "#064E3B"
        },
        rose: {
          500: "#F43F5E",
          900: "#881337"
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B"
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
