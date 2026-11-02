import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    // Vitest default environment is Node.
    // Component test files override this with: // @vitest-environment jsdom
    environment: 'node',
    globals: true,
    setupFiles: [],
  },
})
