'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmacionPage() {
  const router = useRouter()
  const params = useParams()
  const tramiteId = params.id as string
  const token = useAuthStore((state) => state.token)
  const [tramite, setTramite] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Cargar el trámite
    fetch(`/api/tramites/${tramiteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTramite(data.tramite)
        }
      })
      .catch((err) => console.error('Error al cargar trámite:', err))
      .finally(() => setIsLoading(false))
  }, [tramiteId, token, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!tramite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Trámite no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Trámite Completado!
          </h1>
          <p className="text-gray-600">
            Tu expediente de divorcio voluntario ha sido generado exitosamente
          </p>
        </div>

        {/* Información del Trámite */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Trámite</CardTitle>
            <CardDescription>
              Guarda esta información para futuras referencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Folio del trámite</p>
              <p className="font-mono text-lg font-semibold">{tramite.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {tramite.estado}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de creación</p>
              <p className="font-medium">
                {new Date(tramite.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Datos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen del Expediente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tramite.datos.conyuge1_nombre && (
              <div>
                <p className="text-sm text-gray-500">Cónyuge 1</p>
                <p className="font-medium">
                  {tramite.datos.conyuge1_nombre} {tramite.datos.conyuge1_apellidos}
                </p>
              </div>
            )}
            {tramite.datos.conyuge2_nombre && (
              <div>
                <p className="text-sm text-gray-500">Cónyuge 2</p>
                <p className="font-medium">
                  {tramite.datos.conyuge2_nombre} {tramite.datos.conyuge2_apellidos}
                </p>
              </div>
            )}
            {tramite.datos.matrimonio_fecha && (
              <div>
                <p className="text-sm text-gray-500">Fecha de matrimonio</p>
                <p className="font-medium">
                  {new Date(tramite.datos.matrimonio_fecha).toLocaleDateString('es-MX')}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Documentos anexados</p>
              <p className="font-medium">{tramite.documentos?.length || 0} documentos</p>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Pasos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Revisar el expediente</p>
                  <p className="text-gray-600">
                    Descarga y revisa que toda la información esté correcta
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Esperar la validación</p>
                  <p className="text-gray-600">
                    El expediente será revisado por la autoridad competente
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">Recibir notificación</p>
                  <p className="text-gray-600">
                    Te notificaremos por email sobre el estado de tu trámite
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" disabled>
            Descargar Expediente (PDF)
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">Volver al Dashboard</Button>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Recibirás una copia de este expediente en tu correo electrónico
        </p>
      </div>
    </div>
  )
}
