'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function InvitarPage() {
  const router = useRouter()
  const params = useParams()
  const tramiteId = params.id as string
  const { token } = useAuthStore()

  const [emailInvitado, setEmailInvitado] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [tramite, setTramite] = useState<any>(null)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Cargar información del trámite
    const cargarTramite = async () => {
      try {
        const response = await fetch(`/api/tramites/${tramiteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Error al cargar trámite')
        }

        const data = await response.json()
        setTramite(data.tramite)

        // Verificar que el usuario es el solicitante
        if (data.tramite.miRol !== 'SOLICITANTE') {
          router.push(`/tramites/divorcio/${tramiteId}`)
        }
      } catch (error) {
        console.error('Error:', error)
        setError('Error al cargar el trámite')
      }
    }

    cargarTramite()
  }, [tramiteId, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/invitaciones/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tramiteId,
          emailInvitado,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar invitación')
      }

      setExito(true)
      setEmailInvitado('')

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!tramite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tsj-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-tsj-primary px-6 py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/10 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Invitar al Segundo Cónyuge
            </h1>
            <p className="text-white/90 text-center mt-2">
              Completa tus datos personales exitosamente
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            {exito ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Invitación Enviada
                </h2>
                <p className="text-gray-600 mb-4">
                  Se ha enviado un correo electrónico a{' '}
                  <strong>{emailInvitado}</strong> con las instrucciones para
                  continuar el trámite.
                </p>
                <p className="text-sm text-gray-500">
                  Redirigiendo al dashboard...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Siguiente Paso
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Para continuar con el trámite de divorcio, necesitas
                            que tu cónyuge complete sus datos personales.
                          </p>
                          <p className="mt-2">
                            Ingresa su correo electrónico y le enviaremos una
                            invitación para que pueda acceder al trámite.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Correo electrónico del segundo cónyuge
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={emailInvitado}
                        onChange={(e) => setEmailInvitado(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tsj-primary focus:border-transparent"
                        placeholder="ejemplo@correo.com"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enviaremos un correo con un enlace para que pueda
                        completar sus datos
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-red-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-tsj-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-tsj-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Enviando...' : 'Enviar Invitación'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
