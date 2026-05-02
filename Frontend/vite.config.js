import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Fail the Railway build on any Rollup warning treated as error
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    }
  },
  // Allows the React Router <BrowserRouter> to handle 404s on refresh
  // (serve --single above handles this on the CDN side)
  server: {
    port: 5173
  }
})