/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Absolute WebSocket URL for the live chat (community service). */
  readonly VITE_WS_URL?: string
}
