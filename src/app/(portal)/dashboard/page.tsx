'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  BORRADOR: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800' },
  ESPERANDO_CONYUGE_2: { label: 'Esperando al segundo cónyuge', color: 'bg-blue-100 text-blue-800' },
  EN_PROGRESO: { label: 'Listo para firmar', color: 'bg-green-100 text-green-800' },
  COMPLETADO: { label: 'Completado', color: 'bg-gray-100 text-gray-600' },
}

export default function DashboardPage() {
  const router = useRouter()
  const { usuario, token, clearAuth } = useAuthStore()
  const [tramites, setTramites] = useState<any[]>([])

  useEffect(() => {
    if (!usuario) {
      router.push('/login')
    }
  }, [usuario, router])

  useEffect(() => {
    if (!token) return
    fetch('/api/tramites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.tramites) setTramites(data.tramites)
      })
      .catch(() => {})
  }, [token])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirigiendo...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tsj-bg">
      {/* Header */}
      <Header />

      {/* User Info Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <span className="text-base text-black">
              Bienvenido, <span className="font-bold text-tsj-title">{usuario.nombre}</span>
            </span>
            <Button onClick={handleLogout} variant="outline">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-16">

        {/* Trámites en curso */}
        {tramites.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-tsj-title mb-6">Mis Trámites</h2>
            <div className="space-y-4">
              {tramites.map((t) => {
                const estado = ESTADO_LABELS[t.estado] ?? { label: t.estado, color: 'bg-gray-100 text-gray-600' }
                const href = t.tipo === 'DIVORCIO_VOLUNTARIO'
                  ? `/tramites/divorcio/${t.id}`
                  : `/tramites/${t.id}`
                return (
                  <div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t.tipo === 'DIVORCIO_VOLUNTARIO' ? 'Divorcio Voluntario' : t.tipo}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Creado el {new Date(t.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.label}
                      </span>
                      {t.estado !== 'COMPLETADO' && (
                        <Link href={href}>
                          <Button>Continuar</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-tsj-title mb-3">
            Trámites Disponibles
          </h2>
          <p className="text-lg text-black">
            Selecciona el trámite que deseas realizar
          </p>
        </div>

        {/* Trámites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Divorcio Voluntario */}
          <Link href="/tramites/divorcio/nuevo">
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-tsj-title">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-tsj-primary rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-tsj-title" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Divorcio Voluntario</CardTitle>
                <CardDescription className="text-base">
                  Tramita tu divorcio de mutuo acuerdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Iniciar Trámite
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Rectificación de Acta */}
          <Card className="h-full opacity-50 cursor-not-allowed">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-gray-500">Rectificación de Acta</CardTitle>
              <CardDescription className="text-base">
                Corrige errores en actas oficiales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
