import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

/**
 * Gestionnaires par défaut pour les routes fire-and-forget qui ne font pas l'objet
 * de tests dédiés mais sont appelées en arrière-plan lors du rendu de composants.
 * Sans ces handlers, MSW lève une erreur sur Node 20+ avec onUnhandledRequest:'error'.
 */
const defaultHandlers = [
  // CourseEditorPage : attache un media à un cours après sauvegarde du programme
  http.patch('/api/v1/media/:mediaId/attach', () => HttpResponse.json({}, { status: 200 })),
  // ChatPage / CoursePlayer : récupère la salle de discussion d'un cours
  http.get('/api/v1/community/rooms/course/:courseId', () => HttpResponse.json(null, { status: 404 })),
]

/** Serveur MSW partagé. Les tests ajoutent leurs gestionnaires via mswServer.use(...). */
export const mswServer = setupServer(...defaultHandlers)
