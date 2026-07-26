import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset paths relative so the static build works on any host
// (Netlify, Vercel, GitHub Pages project sites, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
})
