import type { Request, Response } from 'express'
import { db } from '../db/client.js'
import { conversacionesService } from '../services/conversaciones.service.js'
import { llamadasService } from '../services/llamadas.service.js'
import { reunionesService } from '../services/reuniones.service.js'

export const reunionesController = {
  // GET /chat/conversaciones/:id/reuniones
  async listar(req: Request, res: Response) {
    const conversacionId = Number(req.params.id)
    const userId = req.usuario!.id

    const esParticipante = await conversacionesService.verificarParticipante(
      db,
      conversacionId,
      userId
    )
    if (!esParticipante) {
      return res.status(403).json({ success: false, message: 'Sin acceso a esta conversación' })
    }

    const data = await reunionesService.listarPorConversacion(db, conversacionId)
    return res.json({ success: true, data })
  },

  // POST /chat/conversaciones/:id/reuniones
  async crear(req: Request, res: Response) {
    const conversacionId = Number(req.params.id)
    const userId = req.usuario!.id
    const { titulo, descripcion, tipo = 'video', fechaInicio, fechaFin, ubicacion, notas, participantesIds } = req.body

    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ success: false, message: 'titulo, fechaInicio y fechaFin son requeridos' })
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      return res.status(400).json({ success: false, message: 'Fechas inválidas' })
    }

    const esParticipante = await conversacionesService.verificarParticipante(
      db,
      conversacionId,
      userId
    )
    if (!esParticipante) {
      return res.status(403).json({ success: false, message: 'Sin acceso a esta conversación' })
    }

    // Si se proveen participantesIds, usarlos (siempre incluir al organizador)
    // Si no, usar todos los participantes de la conversación (comportamiento original)
    let participanteIds: number[]
    if (Array.isArray(participantesIds) && participantesIds.length > 0) {
      const ids = [...new Set([...participantesIds.map(Number), userId])].filter(
        (id) => Number.isInteger(id) && id > 0
      )
      if (ids.length > 50) {
        return res.status(400).json({ success: false, message: 'Máximo 50 participantes por reunión' })
      }
      participanteIds = ids
    } else {
      participanteIds = await reunionesService.obtenerParticipanteIds(db, conversacionId)
    }

    const reunion = await reunionesService.crearReunion(
      db,
      {
        conversacionId,
        organizadorId: userId,
        titulo: titulo.trim(),
        descripcion: descripcion?.trim(),
        tipo,
        fechaInicio: inicio,
        fechaFin: fin,
        ubicacion: ubicacion?.trim(),
        notas: notas?.trim(),
      },
      participanteIds
    )

    // Emitir via Socket.IO
    const io = req.app.get('io')
    io?.to(`conversation:${conversacionId}`).emit('meeting:created', {
      reunion,
      conversacionId,
    })

    return res.status(201).json({ success: true, data: reunion })
  },

  // GET /chat/reuniones/proximas
  async proximas(req: Request, res: Response) {
    const userId = req.usuario!.id
    const data = await reunionesService.listarProximasDelUsuario(db, userId)
    return res.json({ success: true, data })
  },

  // GET /chat/reuniones/:id
  async detalle(req: Request, res: Response) {
    const id = Number(req.params.id)
    const userId = req.usuario!.id

    const reunion = await reunionesService.obtenerConInvitaciones(db, id)
    if (!reunion) {
      return res.status(404).json({ success: false, message: 'Reunión no encontrada' })
    }

    const tieneAcceso = await reunionesService.verificarAcceso(db, id, userId)
    if (!tieneAcceso) {
      return res.status(403).json({ success: false, message: 'Sin acceso a esta reunión' })
    }

    return res.json({ success: true, data: reunion })
  },

  // PATCH /chat/reuniones/:id
  async editar(req: Request, res: Response) {
    const id = Number(req.params.id)
    const userId = req.usuario!.id
    const { titulo, descripcion, fechaInicio, fechaFin, ubicacion, notas, tipo } = req.body

    const patchData: Record<string, unknown> = {}
    if (titulo !== undefined) patchData.titulo = titulo.trim()
    if (descripcion !== undefined) patchData.descripcion = descripcion?.trim()
    if (tipo !== undefined) patchData.tipo = tipo
    if (ubicacion !== undefined) patchData.ubicacion = ubicacion?.trim()
    if (notas !== undefined) patchData.notas = notas?.trim()
    if (fechaInicio !== undefined) patchData.fechaInicio = new Date(fechaInicio)
    if (fechaFin !== undefined) patchData.fechaFin = new Date(fechaFin)

    const reunion = await reunionesService.editarReunion(db, id, userId, patchData as Parameters<typeof reunionesService.editarReunion>[3])
    if (!reunion) {
      return res.status(404).json({ success: false, message: 'Reunión no encontrada o sin permisos' })
    }

    const io = req.app.get('io')
    io?.to(`conversation:${reunion.conversacionId}`).emit('meeting:updated', {
      reunion,
      conversacionId: reunion.conversacionId,
    })

    return res.json({ success: true, data: reunion })
  },

  // DELETE /chat/reuniones/:id
  async cancelar(req: Request, res: Response) {
    const id = Number(req.params.id)
    const userId = req.usuario!.id

    // Capturar llamadaId antes de cancelar (para finalizar si la reunión estaba activa)
    const reunionActual = await reunionesService.obtenerPorId(db, id)

    const reunion = await reunionesService.cancelarReunion(db, id, userId)
    if (!reunion) {
      return res.status(404).json({ success: false, message: 'Reunión no encontrada o sin permisos' })
    }

    // Si la reunión tenía una llamada activa, finalizarla
    if (reunionActual?.llamadaId) {
      await llamadasService.actualizarEstado(db, reunionActual.llamadaId, 'finalizada')
      const io = req.app.get('io')
      const participanteIds = await llamadasService.obtenerParticipanteIds(db, reunion.conversacionId)
      for (const pid of participanteIds) {
        io?.to(`user:${pid}`).emit('call:ended', { llamadaId: reunionActual.llamadaId, reason: 'finalizada' })
      }
    }

    const io = req.app.get('io')
    io?.to(`conversation:${reunion.conversacionId}`).emit('meeting:cancelled', {
      reunionId: id,
      conversacionId: reunion.conversacionId,
    })

    return res.json({ success: true, data: { id } })
  },

  // PATCH /chat/reuniones/:id/rsvp
  async rsvp(req: Request, res: Response) {
    const id = Number(req.params.id)
    const userId = req.usuario!.id
    const { estado } = req.body

    if (!['pendiente', 'aceptada', 'rechazada', 'tentativa'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' })
    }

    const invitacion = await reunionesService.responderInvitacion(db, id, userId, estado)
    if (!invitacion) {
      return res.status(404).json({ success: false, message: 'Invitación no encontrada' })
    }

    const reunion = await reunionesService.obtenerPorId(db, id)
    if (reunion) {
      const io = req.app.get('io')
      io?.to(`conversation:${reunion.conversacionId}`).emit('meeting:rsvp', {
        reunionId: id,
        userId,
        estado,
      })
    }

    return res.json({ success: true, data: invitacion })
  },

  // POST /chat/reuniones/:id/iniciar
  async iniciar(req: Request, res: Response) {
    const id = Number(req.params.id)
    const userId = req.usuario!.id

    const reunion = await reunionesService.obtenerPorId(db, id)
    if (!reunion) {
      return res.status(404).json({ success: false, message: 'Reunión no encontrada' })
    }
    if (reunion.estado !== 'programada') {
      return res.status(400).json({ success: false, message: `No se puede iniciar una reunión en estado '${reunion.estado}'` })
    }
    if (reunion.tipo === 'presencial') {
      return res.status(400).json({ success: false, message: 'Las reuniones presenciales no generan llamada' })
    }

    const tieneAcceso = await reunionesService.verificarAcceso(db, id, userId)
    if (!tieneAcceso) {
      return res.status(403).json({ success: false, message: 'Sin acceso a esta reunión' })
    }

    // Crear llamada LiveKit reutilizando el servicio existente
    const organizador = await llamadasService.obtenerUsuario(db, userId)
    if (!organizador) {
      return res.status(500).json({ success: false, message: 'Usuario no encontrado' })
    }

    const roomName = llamadasService.generateRoomName(reunion.conversacionId)
    const llamada = await llamadasService.crearLlamada(db, {
      conversacionId: reunion.conversacionId,
      iniciadoPor: userId,
      tipo: reunion.tipo as 'voz' | 'video',
      estado: 'activa',
      livekitRoom: roomName,
    })

    const token = await llamadasService.generateToken(roomName, userId, organizador.nombreCompleto)

    // Vincular llamada a la reunión
    const reunionActiva = await reunionesService.marcarIniciada(db, id, llamada.id)

    const io = req.app.get('io')
    io?.to(`conversation:${reunion.conversacionId}`).emit('meeting:starting', {
      reunion: reunionActiva,
      llamadaId: llamada.id,
    })

    return res.json({
      success: true,
      data: {
        reunion: reunionActiva,
        llamada: {
          id: llamada.id,
          token,
          livekitUrl: process.env.LIVEKIT_URL,
          roomName,
        },
      },
    })
  },
}
