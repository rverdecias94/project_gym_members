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
        description: 'Aplicación para gestionar y monitoriar toda la información de un gimnasio',
        theme_color: 'rgb(53, 109, 172)',
        background_color: 'rgb(53, 109, 172)',
        display: 'standalone',
        start_url: '/login',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/CI.png',
            sizes: '294x172',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '139x50',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000
  },

})
