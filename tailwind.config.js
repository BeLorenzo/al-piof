/** @type {import('tailwindcss').Config} */

// Le palette "slate" (neutri) e "sky" (accento) sono pilotate da variabili CSS
// impostate a runtime da src/utils/themeUtils.ts: ogni preset ridefinisce l'intera scala,
// cosi' tutte le classi (incluse le varianti con opacita' es. bg-slate-900/70) restano coerenti.
const cssVar = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix, steps) =>
  Object.fromEntries(steps.map((s) => [s, cssVar(`${prefix}-${s}`)]));

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

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
        white: cssVar('c-white'),
        slate: scale('n', STEPS),
        sky: scale('a', STEPS),
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
