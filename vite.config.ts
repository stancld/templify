import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-docx': ['docx-preview'],
          'vendor-jszip': ['jszip'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
