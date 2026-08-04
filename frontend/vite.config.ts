import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is done manually via the `virtual:pwa-register/react`
      // hook (see src/app/UpdatePrompt.tsx) instead of the plugin's own
      // injected script — autoUpdate swaps the service worker in the
      // background silently, but a tab left open across a deploy keeps
      // running old JS referencing since-deleted chunk files until it's
      // told to reload. The hook surfaces `needRefresh` so we can prompt
      // the user instead of leaving them on a silently-stale page.
      injectRegister: null,
      includeAssets: ['brand/ztf-logo.png'],
      manifest: {
        name: 'ZTF Music Académie',
        short_name: 'ZTF Music',
        description:
          'Cinq départements, vingt-six parcours du certificat au doctorat. Les méthodes des grandes académies, enseignées en Afrique.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        // Couleurs de marque — voir src/app/styles/tokens.css (registre clair : --ink / --paper).
        background_color: '#FAF8F3',
        theme_color: '#0A2540',
        icons: [
          {
            // Seul logo disponible dans public/ — pas de jeu d'icônes 192/512 dédié.
            // Déclaré en "any" plutôt que d'inventer des tailles inexistantes.
            src: '/brand/ztf-logo.png',
            sizes: '230x230',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/brand/ztf-logo.png',
            sizes: '230x230',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Ne jamais mettre en cache l'authentification ou les paiements — doivent
        // toujours atteindre le réseau, même en mode offline (échec explicite sinon).
        // /oauth2 et /login/oauth2 doivent aussi passer en direct : ce sont des
        // navigations plein-page vers Google puis vers le callback backend — si le
        // service worker les intercepte, il sert l'app shell en cache (404 React
        // Router) au lieu de laisser la requête atteindre le gateway.
        navigateFallbackDenylist: [
          /^\/api\/v1\/auth/,
          /^\/api\/v1\/payments/,
          /^\/oauth2/,
          /^\/login\/oauth2/,
        ],
        runtimeCaching: [
          {
            // Catalogue de cours : network-first avec repli cache de courte durée,
            // pour rester à jour tout en supportant de mauvaises connexions.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              url.pathname.startsWith('/api/v1/courses') &&
              !url.pathname.startsWith('/api/v1/auth') &&
              !url.pathname.startsWith('/api/v1/payments'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'course-catalogue-api',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 5 * 60, // 5 minutes — repli seulement, jamais la source de vérité.
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Jamais de cache pour l'authentification, quelle que soit la méthode.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/auth'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            // Jamais de cache pour les paiements, quelle que soit la méthode.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/payments'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendors volumineux et stables, isolés du code applicatif : ils changent
        // rarement d'une mise en production à l'autre et restent donc en cache
        // navigateur même quand le reste du bundle est invalidé.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
      '/login/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
      // Direct to zma-community, not the gateway — matches nginx.conf in prod
      '/ws': { target: 'http://localhost:8087', ws: true, changeOrigin: true },
    },
  },
})
