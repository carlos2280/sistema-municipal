import {
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../../config/schemaPG.js'

export const estadoUsuarios = mensajeriaSchema.table('estado_usuarios', {
  usuarioId: integer('usuario_id').primaryKey(),
  estado: text('estado').default('offline').$type<'online' | 'away' | 'busy' | 'offline'>(),
  ultimaConexion: timestamp('ultima_conexion'),
  socketId: text('socket_id'),
})

export type EstadoUsuario = typeof estadoUsuarios.$inferSelect
export type NewEstadoUsuario = typeof estadoUsuarios.$inferInsert
