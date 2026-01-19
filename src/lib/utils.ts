import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de manera eficiente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a formato legible
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

/**
 * Formatea el nombre completo de un cónyuge
 */
export function formatNombreCompleto(
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string
): string {
  return `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim()
}
