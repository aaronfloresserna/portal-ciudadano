'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'

export default function DashboardPage() {
  const router = useRouter()
  const { usuario, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!usuario) {
      router.push('/login')
    }
  }, [usuario, router])

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* User Info Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Bienvenido, <span className="font-semibold text-pan-blue">{usuario.nombre}</span>
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Bienvenido a tu portal de trámites administrativos
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Trámite</CardTitle>
              <CardDescription>
                Iniciar un trámite de divorcio voluntario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tramites/divorcio/nuevo">
                <Button className="w-full">
                  Iniciar Divorcio Voluntario
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mis Trámites</CardTitle>
              <CardDescription>
                Ver el estado de tus trámites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                No tienes trámites activos
              </p>
              <Button variant="outline" className="w-full" disabled>
                Ver Trámites
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Actualizar tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {usuario.email}
                </div>
                {usuario.telefono && (
                  <div>
                    <span className="font-medium">Teléfono:</span> {usuario.telefono}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50 border-2 border-pan-blue">
            <CardHeader>
              <CardTitle className="text-pan-blue">
                ¿Qué es el Divorcio Voluntario?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                El divorcio voluntario es un procedimiento administrativo sin controversia
                donde ambos cónyuges están de acuerdo en disolver el matrimonio. Este
                portal te ayuda a generar el expediente completo de forma digital.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-2 border-pan-blue">
            <CardHeader>
              <CardTitle className="text-pan-blue">
                Documentos Necesarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>INE de ambos cónyuges</li>
                <li>Acta de matrimonio original</li>
                <li>Convenio de divorcio firmado</li>
                <li>Actas de nacimiento de hijos (si aplica)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
