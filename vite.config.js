import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'GYManager',
        short_name: 'GYManager',
        description: 'Aplicación para gestionar y monitoriar la información de un gimnasio',
        theme_color: 'rgb(53, 109, 172)',
        background_color: 'rgb(53, 109, 172)',
        display: 'standalone',
        display_override: ['window-controls-overlay'],
        lang: 'es-ES',
        start_url: '/',
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
    }),
  ],
  server: {
    port: 3000
  },

})
