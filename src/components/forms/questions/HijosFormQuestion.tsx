'use client'

import { useState, useEffect } from 'react'
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
  }, [numeroHijos])

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
            Hijo {index + 1} de {numeroHijos}
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
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(index, file)
                }}
                className="text-lg py-6"
                disabled={isUploading[index]}
              />
              {isUploading[index] && (
                <p className="text-sm text-blue-600 mt-2">Subiendo archivo...</p>
              )}
              {uploadError[index] && (
                <p className="text-sm text-red-600 mt-2">{uploadError[index]}</p>
              )}
              {hijo.actaNacimiento && !isUploading[index] && (
                <p className="text-sm text-green-600 mt-2">✓ Acta subida correctamente</p>
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
