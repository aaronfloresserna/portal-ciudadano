'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

function AceptarInvitacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token_invitacion = searchParams.get('token')
  const { token: authToken, usuario } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [aceptando, setAceptando] = useState(false)
  const [error, setError] = useState('')
  const [invitacion, setInvitacion] = useState<any>(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!token_invitacion) {
      setError('Token de invitación no proporcionado')
      setLoading(false)
      return
    }

    const verificarInvitacion = async () => {
      try {
        const response = await fetch(
          `/api/invitaciones/verificar?token=${token_invitacion}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al verificar invitación')
        }

        setInvitacion(data.invitacion)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    verificarInvitacion()
  }, [token_invitacion])

  const handleAceptar = async () => {
    if (!authToken) {
      // Redirigir a login, guardando el token de invitación en la URL
      router.push(`/login?redirect=/invitacion/aceptar?token=${token_invitacion}`)
      return
    }

    setAceptando(true)
    setError('')

    try {
      const response = await fetch('/api/invitaciones/aceptar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token: token_invitacion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al aceptar invitación')
      }

      setExito(true)

      // Redirigir al formulario después de 2 segundos
      setTimeout(() => {
        router.push(`/tramites/divorcio/${data.tramiteId}`)
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setAceptando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tsj-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando invitación...</p>
        </div>
      </div>
    )
  }

  if (error && !invitacion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación No Válida
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-tsj-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-tsj-secondary transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
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
            Invitación Aceptada
          </h2>
          <p className="text-gray-600 mb-4">
            Has aceptado la invitación exitosamente. Ahora puedes completar tus
            datos personales.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo al formulario...</p>
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
                    d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Invitación a Trámite de Divorcio
            </h1>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            {invitacion && (
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
                          Detalles de la Invitación
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 space-y-1">
                          <p>
                            <strong>{invitacion.solicitante.nombre}</strong> te ha
                            invitado a participar en un trámite de divorcio
                            voluntario.
                          </p>
                          <p>
                            Email del solicitante:{' '}
                            <strong>{invitacion.solicitante.email}</strong>
                          </p>
                          <p className="text-xs mt-2">
                            Esta invitación expira el{' '}
                            {new Date(invitacion.expiraEn).toLocaleDateString(
                              'es-MX',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!authToken ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Necesitas iniciar sesión o crear una cuenta para
                            aceptar esta invitación.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : usuario?.email !== invitacion.emailInvitado ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
                          <h3 className="text-sm font-medium text-red-800">
                            Email Incorrecto
                          </h3>
                          <p className="text-sm text-red-700 mt-1">
                            Esta invitación fue enviada a{' '}
                            <strong>{invitacion.emailInvitado}</strong>, pero
                            estás conectado como <strong>{usuario?.email}</strong>
                            .
                          </p>
                          <p className="text-sm text-red-700 mt-2">
                            Por favor, cierra sesión e inicia sesión con la cuenta
                            correcta.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
                </div>

                <div className="flex gap-4">
                  <Link
                    href="/dashboard"
                    className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    onClick={handleAceptar}
                    disabled={
                      aceptando ||
                      !authToken ||
                      usuario?.email !== invitacion.emailInvitado
                    }
                    className="flex-1 bg-tsj-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-tsj-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!authToken
                      ? 'Iniciar Sesión para Aceptar'
                      : aceptando
                      ? 'Aceptando...'
                      : 'Aceptar Invitación'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AceptarInvitacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tsj-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AceptarInvitacionContent />
    </Suspense>
  )
}
