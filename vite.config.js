import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Cesam Esthetic',
        short_name: 'Cesam',
        description: 'Portail Partenaires et SAV Cesam Esthetic',
        theme_color: '#070e24',
        background_color: '#02040a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      'terebic-corrine-overcherished.ngrok-free.dev'
    ]
  }
})



