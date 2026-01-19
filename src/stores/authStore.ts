import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Usuario {
  id: string
  email: string
  nombre: string
  telefono?: string | null
  createdAt: Date
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isLoading: boolean
  setAuth: (token: string, usuario: Usuario) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isLoading: false,

      setAuth: (token, usuario) =>
        set({ token, usuario, isLoading: false }),

      clearAuth: () =>
        set({ token: null, usuario: null, isLoading: false }),

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // nombre en localStorage
    }
  )
)

// Hook personalizado para hacer el login
export async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión')
  }

  return data
}

// Hook personalizado para hacer el registro
export async function register(
  email: string,
  password: string,
  nombre: string,
  telefono?: string
) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre, telefono }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar usuario')
  }

  return data
}

// Hook personalizado para obtener el usuario actual
export async function getCurrentUser(token: string) {
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener usuario')
  }

  return data.usuario
}
