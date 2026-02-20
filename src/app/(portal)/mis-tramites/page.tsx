'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  BORRADOR: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800' },
  ESPERANDO_CONYUGE_2: { label: 'Esperando al segundo cónyuge', color: 'bg-blue-100 text-blue-800' },
  EN_PROGRESO: { label: 'Listo para firmar', color: 'bg-green-100 text-green-800' },
  COMPLETADO: { label: 'Completado', color: 'bg-gray-100 text-gray-600' },
}

const TIPO_LABEL: Record<string, string> = {
  DIVORCIO_VOLUNTARIO: 'Divorcio Voluntario',
}

export default function MisTramitesPage() {
  const router = useRouter()
  const { usuario, token } = useAuthStore()
  const [tramites, setTramites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      .finally(() => setLoading(false))
  }, [token])

  if (!usuario) return null

  const getTramiteHref = (t: any) => {
    if (t.tipo === 'DIVORCIO_VOLUNTARIO') return `/tramites/divorcio/${t.id}`
    return `/tramites/${t.id}`
  }

  return (
    <div className="min-h-screen bg-tsj-bg">
      <Header />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-tsj-title">Mis Trámites</h1>
            <p className="text-gray-600 mt-1">Historial y estado de tus solicitudes</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">← Volver al inicio</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tsj-title" />
          </div>
        ) : tramites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Aún no tienes trámites iniciados.</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Iniciar un trámite</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Trámite</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tramites.map((t) => {
                  const estado = ESTADO_CONFIG[t.estado] ?? { label: t.estado, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {TIPO_LABEL[t.tipo] ?? t.tipo}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">
                        {t.miRol === 'SOLICITANTE' ? 'Solicitante' : 'Cónyuge'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.estado !== 'COMPLETADO' ? (
                          <Link href={getTramiteHref(t)}>
                            <Button size="sm">Continuar</Button>
                          </Link>
                        ) : (
                          <Link href={`/tramites/divorcio/${t.id}/convenio`}>
                            <Button size="sm" variant="outline">Ver convenio</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
