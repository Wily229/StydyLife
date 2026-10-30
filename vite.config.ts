import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2,json,mp3,png}'] },
    manifest: { name: 'Précieux', short_name: 'Précieux', lang: 'fr',
      theme_color: '#282B4A', background_color: '#EEEBDA', display: 'standalone',
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }
  })],
  test: { environment: 'node' }
});
