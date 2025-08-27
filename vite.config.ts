import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Expose API_KEY to the client side code to follow the coding guidelines.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
})
