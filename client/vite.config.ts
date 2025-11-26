import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Serve the project's root public/ so images like gatorbanner.png
  // and gatorwelcome.png are available to the Vite dev server.
  publicDir: '../public',
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
