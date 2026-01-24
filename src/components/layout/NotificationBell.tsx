'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  useNotificacionesStore,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  eliminarNotificacion,
} from '@/stores/notificacionesStore'

export function NotificationBell() {
  const router = useRouter()
  const { token } = useAuthStore()
  const {
    notificaciones,
    noLeidas,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
    iniciarPolling,
    detenerPolling,
  } = useNotificacionesStore()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Iniciar polling al montar el componente
  useEffect(() => {
    if (token) {
      iniciarPolling(token)
    }

    return () => {
      detenerPolling()
    }
  }, [token, iniciarPolling, detenerPolling])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = async (notificacion: any) => {
    if (!token) return

    // Marcar como leída
    if (!notificacion.leida) {
      try {
        await marcarNotificacionLeida(notificacion.id, token)
        marcarLeida(notificacion.id)
      } catch (error) {
        console.error('Error al marcar notificación:', error)
      }
    }

    // Navegar al trámite si existe
    if (notificacion.tramiteId) {
      router.push(`/tramites/divorcio/${notificacion.tramiteId}`)
      setIsOpen(false)
    }
  }

  const handleMarcarTodasLeidas = async () => {
    if (!token) return

    try {
      await marcarTodasNotificacionesLeidas(token)
      marcarTodasLeidas()
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const handleEliminar = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!token) return

    try {
      await eliminarNotificacion(id, token)
      eliminar(id)
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
    }
  }

  const formatearFecha = (fecha: Date) => {
    const now = new Date()
    const notifDate = new Date(fecha)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} h`
    if (diffDays < 7) return `Hace ${diffDays} d`

    return notifDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campanilla */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge de notificaciones no leídas */}
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h3>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodasLeidas}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.3-5.542m3.155 6.852a3 3 0 005.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 003.536-1.003A8.967 8.967 0 0118 9.75V9A6 6 0 006.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
                  />
                </svg>
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  onClick={() => handleNotificationClick(notificacion)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notificacion.leida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!notificacion.leida && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {notificacion.titulo}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notificacion.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatearFecha(notificacion.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleEliminar(notificacion.id, e)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Eliminar notificación"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
