/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: string
  readonly VITE_MF_STORE_URL: string
  readonly VITE_MF_UI_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_API_CHAT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'mf_store/store' {
  import type { Store } from 'redux'
  import type { Persistor } from 'redux-persist'

  export function createStore(): { store: Store; persistor: Persistor }
  export const useAppDispatch: () => unknown
  export const useAppSelector: <T>(selector: (state: unknown) => T) => T

  // Selectores de autenticación
  export const selectUsuarioId: (state: unknown) => number | null
  export const selectIsAuthenticated: (state: unknown) => boolean
  export const selectSistemaId: (state: unknown) => number | null
  export const selectAreaId: (state: unknown) => number | null

  // ============ TIPOS DEL CHAT ============

  export interface Usuario {
    id: number
    nombreCompleto: string
    email: string
    avatarUrl?: string
  }

  export interface Participante {
    id: number
    usuarioId: number
    conversacionId: number
    rol: 'admin' | 'miembro'
    silenciado: boolean
    ultimaLectura?: string
    usuario: Usuario
  }

  export interface UltimoMensaje {
    id: number
    contenido: string
    tipo: string
    createdAt: string
    remitente: {
      id: number
      nombreCompleto: string
    }
  }

  export interface Conversacion {
    id: number
    tipo: 'directa' | 'grupo'
    nombre?: string
    descripcion?: string
    avatarUrl?: string
    activo: boolean
    creadorId: number
    createdAt: string
    updatedAt: string
    participantes: Participante[]
    ultimoMensaje?: UltimoMensaje
    mensajesNoLeidos: number
  }

  export interface Archivo {
    id: number
    nombre: string
    tipo: string
    tamanio: number
    url: string
    thumbnailUrl?: string
  }

  export interface Mensaje {
    id: number
    conversacionId: number
    remitenteId: number
    contenido: string
    tipo: 'texto' | 'archivo' | 'imagen' | 'sistema'
    replyToId?: number
    editado: boolean
    eliminado: boolean
    createdAt: string
    updatedAt: string
    remitente: Usuario
    archivos?: Archivo[]
  }

  export interface MensajesResponse {
    mensajes: Mensaje[]
    nextCursor?: string
  }

  export interface ObtenerMensajesRequest {
    conversacionId: number
    cursor?: string
  }

  export interface CrearMensajeRequest {
    conversacionId: number
    contenido: string
    tipo?: 'texto' | 'archivo' | 'imagen'
    replyToId?: number
  }

  // ============ REQUESTS ============

  export interface BuscarUsuariosRequest {
    q?: string
    limit?: number
  }

  export interface CrearConversacionDirectaRequest {
    destinatarioId: number
  }

  export interface CrearGrupoRequest {
    nombre: string
    descripcion?: string
    participantes: number[]
  }

  // ============ HOOKS DEL CHAT ============

  export function useBuscarUsuariosQuery(
    params: BuscarUsuariosRequest,
    options?: { skip?: boolean }
  ): {
    data: Usuario[] | undefined
    isLoading: boolean
    error: unknown
    refetch: () => void
  }

  export function useObtenerConversacionesQuery(): {
    data: Conversacion[] | undefined
    isLoading: boolean
    error: unknown
    refetch: () => void
  }

  export function useObtenerMensajesQuery(
    params: ObtenerMensajesRequest,
    options?: { skip?: boolean }
  ): {
    data: MensajesResponse | undefined
    isLoading: boolean
    error: unknown
    refetch: () => void
  }

  export function useCrearConversacionDirectaMutation(): [
    (params: CrearConversacionDirectaRequest) => { unwrap: () => Promise<Conversacion> },
    { isLoading: boolean; error: unknown }
  ]

  export function useCrearGrupoMutation(): [
    (params: CrearGrupoRequest) => { unwrap: () => Promise<Conversacion> },
    { isLoading: boolean; error: unknown }
  ]

  export function useCrearMensajeMutation(): [
    (params: CrearMensajeRequest) => { unwrap: () => Promise<Mensaje> },
    { isLoading: boolean; error: unknown }
  ]
}

declare module 'mf_ui/components' {
  export const PageHeader: React.FC<{ title: string; subtitle?: string }>
  export const AppLoader: React.FC
  export const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }>
  export const UserAvatar: React.FC<{ name: string; size?: number }>
  export const SearchInput: React.FC<{
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }>
}

declare module 'mf_ui/theme' {
  import type { ReactNode, ComponentType } from 'react'
  import type { Theme } from '@mui/material/styles'

  export const ThemeProvider: ComponentType<{ children: ReactNode }>
  export const useTheme: () => {
    isDarkMode: boolean
    toggleTheme: () => void
  }
  export const lightTheme: Theme
  export const darkTheme: Theme
}
