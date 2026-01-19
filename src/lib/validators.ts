import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Divorcio Schemas
export const conyugeSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(2, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().min(2, 'El apellido materno es requerido'),
  curp: z.string().length(18, 'El CURP debe tener 18 caracteres').regex(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/, 'CURP inválido'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  lugarNacimiento: z.string().min(2, 'El lugar de nacimiento es requerido'),
})

export const matrimonioSchema = z.object({
  fechaCelebracion: z.string().min(1, 'La fecha de celebración es requerida'),
  lugarCelebracion: z.string().min(2, 'El lugar de celebración es requerido'),
  regimenPatrimonial: z.enum(['SEPARACION_BIENES', 'SOCIEDAD_CONYUGAL'], {
    errorMap: () => ({ message: 'Seleccione un régimen patrimonial' }),
  }),
  tieneHijos: z.boolean(),
  numeroHijos: z.number().int().min(0).optional(),
})

// Export types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ConyugeInput = z.infer<typeof conyugeSchema>
export type MatrimonioInput = z.infer<typeof matrimonioSchema>
