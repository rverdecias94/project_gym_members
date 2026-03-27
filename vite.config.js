import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Tronoss',
        short_name: 'Tronoss',
        description: 'Plataforma para gestionar gimnasios y tiendas: membresías, pagos, inventario y sorteos. Administra socios, entrenadores y ventas desde cualquier dispositivo.',
        theme_color: 'rgb(53, 109, 172)',
        background_color: 'rgb(53, 109, 172)',
        display: 'standalone',
        lang: 'es-ES',
        start_url: '/login',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
      }
    }),
  ],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000
  },

})
