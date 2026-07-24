import { setupServer } from 'msw/node'

/** Serveur MSW partagé. Les tests ajoutent leurs gestionnaires via mswServer.use(...). */
export const mswServer = setupServer()
