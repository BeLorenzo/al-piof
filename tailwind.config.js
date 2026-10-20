/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        tech: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        slate: {
          950: '#020617',
        },
        oled: {
          base: '#000000',
          card: '#09090b',
          border: '#18181b',
        },
        swiss: {
          base: '#111215',
          card: '#18191e',
          red: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
