import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#1b1f27',
        panelraised: '#232833',
        edge: '#2f3644',
        accent: '#4f9cf9',
      },
    },
  },
  plugins: [
    // named to match Tailwind v4's built-in variant, so a future upgrade
    // just deletes this plugin
    plugin(({ addVariant }) => {
      addVariant('pointer-coarse', '@media (pointer: coarse)')
      addVariant('pointer-fine', '@media (pointer: fine)')
    }),
  ],
}
