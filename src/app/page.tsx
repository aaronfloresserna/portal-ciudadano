'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function Home() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    // Si el usuario está autenticado, ir al dashboard
    // Si no, ir al login
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Portal Ciudadano
        </h1>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
