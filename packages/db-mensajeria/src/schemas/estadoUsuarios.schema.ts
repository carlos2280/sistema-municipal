import { integer, pgEnum, text, timestamp } from 'drizzle-orm/pg-core'
import { mensajeriaSchema } from '../schemas'

export const estadoUsuarioEnum = pgEnum('estado_usuario', [
  'online',
  'offline',
  'away',
  'busy',
])

export const estadoUsuarios = mensajeriaSchema.table('estado_usuarios', {
  usuarioId: integer('usuario_id').primaryKey(),
  estado: estadoUsuarioEnum('estado').default('offline'),
  ultimaConexion: timestamp('ultima_conexion', { withTimezone: true }),
  socketId: text('socket_id'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export type EstadoUsuario = typeof estadoUsuarios.$inferSelect
export type NewEstadoUsuario = typeof estadoUsuarios.$inferInsert
