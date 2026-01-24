import { create } from 'zustand'

interface Tramite {
  id: string
  tipo: string
  estado: string
}

interface Notificacion {
  id: string
  usuarioId: string
  tramiteId: string | null
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: Date
  tramite?: Tramite | null
}

interface NotificacionesState {
  notificaciones: Notificacion[]
  noLeidas: number
  isLoading: boolean
  pollingInterval: NodeJS.Timeout | null

  // Acciones
  setNotificaciones: (notificaciones: Notificacion[], noLeidas: number) => void
  agregarNotificacion: (notificacion: Notificacion) => void
  marcarLeida: (id: string) => void
  marcarTodasLeidas: () => void
  eliminar: (id: string) => void
  setLoading: (loading: boolean) => void
  cargarNotificaciones: (token: string) => Promise<void>
  iniciarPolling: (token: string) => void
  detenerPolling: () => void
}

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  notificaciones: [],
  noLeidas: 0,
  isLoading: false,
  pollingInterval: null,

  setNotificaciones: (notificaciones, noLeidas) =>
    set({ notificaciones, noLeidas }),

  agregarNotificacion: (notificacion) =>
    set((state) => ({
      notificaciones: [notificacion, ...state.notificaciones],
      noLeidas: notificacion.leida ? state.noLeidas : state.noLeidas + 1,
    })),

  marcarLeida: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
      noLeidas: Math.max(0, state.noLeidas - 1),
    })),

  marcarTodasLeidas: () =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
      noLeidas: 0,
    })),

  eliminar: (id) =>
    set((state) => {
      const notificacion = state.notificaciones.find((n) => n.id === id)
      const noLeidasDecrement = notificacion && !notificacion.leida ? 1 : 0

      return {
        notificaciones: state.notificaciones.filter((n) => n.id !== id),
        noLeidas: Math.max(0, state.noLeidas - noLeidasDecrement),
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  cargarNotificaciones: async (token: string) => {
    try {
      set({ isLoading: true })

      const response = await fetch('/api/notificaciones', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones')
      }

      const data = await response.json()

      set({
        notificaciones: data.notificaciones,
        noLeidas: data.noLeidas,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      set({ isLoading: false })
    }
  },

  iniciarPolling: (token: string) => {
    // Detener polling anterior si existe
    const { pollingInterval, detenerPolling } = get()
    if (pollingInterval) {
      detenerPolling()
    }

    // Cargar inmediatamente
    get().cargarNotificaciones(token)

    // Configurar polling cada 30 segundos
    const interval = setInterval(() => {
      get().cargarNotificaciones(token)
    }, 30000)

    set({ pollingInterval: interval })
  },

  detenerPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      set({ pollingInterval: null })
    }
  },
}))

// Función auxiliar para marcar una notificación como leída
export async function marcarNotificacionLeida(id: string, token: string) {
  try {
    const response = await fetch(`/api/notificaciones/${id}/marcar-leida`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al marcar notificación como leída')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Función auxiliar para marcar todas como leídas
export async function marcarTodasNotificacionesLeidas(token: string) {
  try {
    const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al marcar notificaciones como leídas')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Función auxiliar para eliminar una notificación
export async function eliminarNotificacion(id: string, token: string) {
  try {
    const response = await fetch(`/api/notificaciones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al eliminar notificación')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
