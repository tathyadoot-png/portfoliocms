import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Single source of truth for DB types (generated, UTF-16). Imported
      // type-only everywhere, so it is never pulled into the runtime bundle.
      '@db': fileURLToPath(
        new URL('./supabase/types/database.types.ts', import.meta.url),
      ),
    },
  },
})
