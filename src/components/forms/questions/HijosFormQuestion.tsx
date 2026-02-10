'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

interface Hijo {
  nombre: string
  fechaNacimiento: string
  edad: number
  actaNacimiento?: any
}

interface HijosFormQuestionProps extends StepComponentProps {
  numeroHijos: number
  tramiteId: string
}

export function HijosFormQuestion({ value, onChange, numeroHijos, tramiteId }: HijosFormQuestionProps) {
  const [hijos, setHijos] = useState<Hijo[]>(
    value || Array.from({ length: numeroHijos }, () => ({
      nombre: '',
      fechaNacimiento: '',
      edad: 0,
      actaNacimiento: null,
    }))
  )
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({})
  const [uploadError, setUploadError] = useState<{ [key: number]: string }>({})
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  // Ajustar el array cuando cambie el número de hijos
  useEffect(() => {
    if (numeroHijos !== hijos.length) {
      const nuevosHijos = Array.from({ length: numeroHijos }, (_, index) => {
        if (hijos[index]) {
          return hijos[index]
        }
        return {
          nombre: '',
          fechaNacimiento: '',
          edad: 0,
          actaNacimiento: null,
        }
      })
      setHijos(nuevosHijos)
      onChange(nuevosHijos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroHijos, hijos.length])

  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const handleChange = (index: number, field: keyof Hijo, valor: string) => {
    const nuevosHijos = [...hijos]

    if (field === 'fechaNacimiento') {
      nuevosHijos[index] = {
        ...nuevosHijos[index],
        fechaNacimiento: valor,
        edad: calcularEdad(valor),
      }
    } else {
      nuevosHijos[index] = {
        ...nuevosHijos[index],
        [field]: valor,
      }
    }

    setHijos(nuevosHijos)
    onChange(nuevosHijos)
  }

  const handleFileUpload = async (index: number, file: File) => {
    setIsUploading({ ...isUploading, [index]: true })
    setUploadError({ ...uploadError, [index]: '' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tramiteId', tramiteId)
      formData.append('tipo', `ACTA_NACIMIENTO_HIJO_${index + 1}`)

      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
        : null

      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir archivo')
      }

      const nuevosHijos = [...hijos]
      nuevosHijos[index] = {
        ...nuevosHijos[index],
        actaNacimiento: data.documento,
      }
      setHijos(nuevosHijos)
      onChange(nuevosHijos)
    } catch (err: any) {
      setUploadError({ ...uploadError, [index]: err.message })
    } finally {
      setIsUploading({ ...isUploading, [index]: false })
    }
  }

  const todosCompletos = hijos.every((hijo) => hijo.nombre && hijo.fechaNacimiento && hijo.actaNacimiento)

  return (
    <div className="space-y-6">
      {hijos.map((hijo, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 className="font-semibold text-black mb-4">
            Hijo(a) {index + 1} de {numeroHijos}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre completo
              </label>
              <Input
                type="text"
                value={hijo.nombre}
                onChange={(e) => handleChange(index, 'nombre', e.target.value)}
                className="text-lg py-6"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fecha de nacimiento
              </label>
              <Input
                type="date"
                value={hijo.fechaNacimiento}
                onChange={(e) => handleChange(index, 'fechaNacimiento', e.target.value)}
                className="text-lg py-6"
                max={new Date().toISOString().split('T')[0]}
              />
              {hijo.fechaNacimiento && (
                <p className="text-sm text-black mt-2">
                  Edad: {hijo.edad} años
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Acta de nacimiento
              </label>

              <input
                ref={(el) => {
                  fileInputRefs.current[index] = el
                }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(index, file)
                }}
                className="hidden"
              />

              {uploadError[index] && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
                  {uploadError[index]}
                </div>
              )}

              {!hijo.actaNacimiento ? (
                <div
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click para examinar
                      </span>{' '}
                      o arrastra el archivo aquí
                    </div>
                    <p className="text-xs text-gray-500">
                      Imágenes (JPG, PNG) o PDF hasta 2MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Acta de nacimiento subida correctamente
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        El archivo ha sido cargado exitosamente
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={isUploading[index]}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}

              {isUploading[index] && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-blue-600">Subiendo archivo...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {!todosCompletos && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-black">
            Por favor completa la información de todos los hijos (nombre, fecha de nacimiento y acta de nacimiento) para continuar
          </p>
        </div>
      )}
    </div>
  )
}
