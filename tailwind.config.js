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
  plugins: [],
}
