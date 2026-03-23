import { env } from '../config/env.js'

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface UsuarioResumen {
  id: number
  nombreCompleto: string
  email: string
}

export interface DepartamentoConUsuarios {
  id: number
  nombre: string
  usuarioIds: number[]
}

// api-identidad devuelve el objeto de usuario directamente (sin envolver)
interface IdentidadUsuarioRaw {
  id: number
  nombreCompleto: string
  email: string
  activo?: boolean
}

// getAllUsuarios devuelve un array directamente
type IdentidadUsuariosListRaw = IdentidadUsuarioRaw[]

// ─── Error tipado ────────────────────────────────────────────────────────────

class IdentidadClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'IdentidadClientError'
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────

async function fetchIdentidad<T>(
  path: string,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const url = `${env.IDENTIDAD_SERVICE_URL}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })

  if (!response.ok) {
    throw new IdentidadClientError(
      `api-identidad respondio ${response.status} para ${path}`,
      response.status,
    )
  }

  return response.json() as Promise<T>
}

// ─── API publica ─────────────────────────────────────────────────────────────

/**
 * Busca usuarios activos en api-identidad cuyo nombre contenga `q`.
 * Excluye al usuario con `excluirId` del resultado.
 * api-identidad no tiene endpoint de busqueda nativo — obtiene todos
 * y filtra en memoria. Adecuado para municipios de tamano tipico.
 */
export async function buscarUsuarios(
  q: string,
  excluirId: number,
  limit = 20,
): Promise<UsuarioResumen[]> {
  const todos = await fetchIdentidad<IdentidadUsuariosListRaw>(
    '/api/v1/identidad/usuarios',
  )

  const termino = q.toLowerCase()

  return todos
    .filter(
      (u) =>
        u.activo !== false &&
        u.id !== excluirId &&
        (termino === '' || u.nombreCompleto.toLowerCase().includes(termino)),
    )
    .slice(0, limit)
    .map(({ id, nombreCompleto, email }) => ({ id, nombreCompleto, email }))
}

/**
 * Obtiene un usuario por ID desde api-identidad.
 * Devuelve undefined si no existe (404).
 */
export async function obtenerUsuarioPorId(
  id: number,
): Promise<UsuarioResumen | undefined> {
  try {
    const raw = await fetchIdentidad<IdentidadUsuarioRaw>(
      `/api/v1/identidad/usuarios/${id}`,
    )
    return { id: raw.id, nombreCompleto: raw.nombreCompleto, email: raw.email }
  } catch (err) {
    if (err instanceof IdentidadClientError && err.status === 404) {
      return undefined
    }
    throw err
  }
}

/**
 * Obtiene multiples usuarios por array de IDs.
 * Omite silenciosamente los IDs que no existen.
 * Usa Promise.allSettled para tolerancia a fallos parciales.
 */
export async function obtenerUsuariosBatch(
  ids: number[],
): Promise<UsuarioResumen[]> {
  if (ids.length === 0) return []

  const resultados = await Promise.allSettled(
    ids.map((id) => obtenerUsuarioPorId(id)),
  )

  const usuarios: UsuarioResumen[] = []
  for (const resultado of resultados) {
    if (resultado.status === 'fulfilled' && resultado.value !== undefined) {
      usuarios.push(resultado.value)
    }
  }
  return usuarios
}

// ─── Tipos internos del organigrama (solo para parseo) ───────────────────────

interface OrgUsuario {
  id: number
}

interface OrgOficina {
  usuarios: OrgUsuario[]
}

interface OrgDepartamento {
  id: number
  nombre: string
  oficinas: OrgOficina[]
}

interface OrgDireccion {
  departamentos: OrgDepartamento[]
}

// El organigrama devuelve el array directamente (OrgDireccion[])
type OrganigramaRaw = OrgDireccion[]

/**
 * Obtiene departamentos con los IDs de usuarios activos de todas sus oficinas.
 * Se usa en gruposSistema para sincronizar grupos de chat por departamento.
 * Llama a /api/v1/identidad/organigrama y aplana la estructura.
 */
export async function obtenerDepartamentosConUsuarios(
  dbName: string,
): Promise<DepartamentoConUsuarios[]> {
  const resultado = await fetchIdentidad<OrganigramaRaw>(
    '/api/v1/identidad/organigrama',
    { 'x-tenant-db-name': dbName },
  )

  const departamentosMap = new Map<number, DepartamentoConUsuarios>()

  for (const direccion of resultado) {
    for (const depto of direccion.departamentos) {
      if (!departamentosMap.has(depto.id)) {
        departamentosMap.set(depto.id, {
          id: depto.id,
          nombre: depto.nombre,
          usuarioIds: [],
        })
      }
      const entry = departamentosMap.get(depto.id)
      if (!entry) continue
      for (const oficina of depto.oficinas) {
        for (const usuario of oficina.usuarios) {
          if (!entry.usuarioIds.includes(usuario.id)) {
            entry.usuarioIds.push(usuario.id)
          }
        }
      }
    }
  }

  return Array.from(departamentosMap.values())
}
