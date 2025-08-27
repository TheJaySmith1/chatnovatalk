import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // FIX: Use relative paths for assets to fix Vercel deployment.
  plugins: [react()],
})