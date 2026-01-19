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
import { loginSchema, type LoginInput } from '@/lib/validators'
import { login, useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await login(data.email, data.password)

      // Guardar token y usuario en el store
      setAuth(response.token, response.usuario)

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo y título */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <img
          src="https://chihuahua.gob.mx/sites/all/themes/Gobierno/images/logo.png"
          alt="Escudo del Estado de Chihuahua"
          className="h-20 w-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-pan-blue">Portal Ciudadano</h1>
        <p className="text-sm text-gray-600">Trámites Administrativos sin Litis</p>
      </div>

      <Card className="w-full max-w-md mt-32">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo y contraseña para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-blue-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
