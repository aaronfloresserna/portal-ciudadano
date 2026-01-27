'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function NuevoDivorcioPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Crear un nuevo trámite
    const crearTramite = async () => {
      try {
        const response = await fetch('/api/tramites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo: 'DIVORCIO_VOLUNTARIO',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('Error en respuesta del API:', data)
          throw new Error(data.error || 'Error al crear trámite')
        }

        if (data.success && data.tramite?.id) {
          // Redirigir al formulario del trámite
          router.push(`/tramites/divorcio/${data.tramite.id}`)
        } else {
          console.error('Respuesta sin success o sin ID de trámite:', data)
          throw new Error('Respuesta inválida del servidor')
        }
      } catch (error: any) {
        console.error('Error al crear trámite:', error.message || error)
        alert('Error al crear el trámite: ' + (error.message || 'Error desconocido'))
        router.push('/dashboard')
      }
    }

    crearTramite()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Iniciando trámite de divorcio...</p>
      </div>
    </div>
  )
}
