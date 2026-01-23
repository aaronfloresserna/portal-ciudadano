'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { registerSchema, type RegisterInput } from '@/lib/validators'
import { register as registerUser, useAuthStore } from '@/stores/authStore'

export default function RegistroPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await registerUser(
        data.email,
        data.password,
        data.nombre,
        data.telefono
      )

      // Guardar token y usuario en el store
      setAuth(response.token, response.usuario)

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tsj-bg py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo y título */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/logos/logo-stj.png"
          alt="Tribunal Superior de Justicia del Estado de Chihuahua"
          className="h-28 w-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-tsj-title">Portal Ciudadano</h1>
        <p className="text-sm text-black">Trámites Administrativos sin Litis</p>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-8">
          <CardTitle className="text-3xl">Crear cuenta</CardTitle>
          <CardDescription className="text-base">
            Ingresa tus datos para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-semibold text-black">
                Nombre completo
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan Pérez García"
                className="h-12 text-base"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-black">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                className="h-12 text-base"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-base font-semibold text-black">
                Teléfono <span className="text-gray-500 font-normal">(opcional)</span>
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="614 123 4567"
                className="h-12 text-base"
                {...register('telefono')}
              />
              {errors.telefono && (
                <p className="text-sm text-red-600 mt-1">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-black">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 text-base"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6 border-t">
          <div className="text-sm text-center">
            <span className="text-gray-600">¿Ya tienes una cuenta?</span>{' '}
            <Link href="/login" className="text-tsj-title hover:text-tsj-primary font-semibold transition-colors">
              Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
