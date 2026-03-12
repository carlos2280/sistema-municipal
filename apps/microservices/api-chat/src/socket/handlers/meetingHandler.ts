/**
 * meetingHandler — sin eventos de entrada desde el cliente.
 * Las operaciones de reuniones (crear, editar, RSVP, iniciar) van por REST.
 * Este handler solo suscribe los sockets a la sala de la conversación
 * para recibir eventos meeting:* emitidos por los controllers.
 *
 * Eventos emitidos (Server → Client):
 *   meeting:created   { reunion, conversacionId }
 *   meeting:updated   { reunion, conversacionId }
 *   meeting:cancelled { reunionId, conversacionId }
 *   meeting:reminder  { reunion, minutosRestantes }
 *   meeting:starting  { reunion, llamadaId }
 *   meeting:rsvp      { reunionId, userId, estado }
 */
import type { Server, Socket } from 'socket.io'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setupMeetingHandlers(_io: Server, _socket: Socket) {
  // Actualmente no hay eventos de entrada desde el cliente para reuniones.
  // Todo el flujo de reuniones es REST → socket.emit desde controllers.
  // Este archivo existe como placeholder para Fase 2 (meeting:join-room, etc.)
}
