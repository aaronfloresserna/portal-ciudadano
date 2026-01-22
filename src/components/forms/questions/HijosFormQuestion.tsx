'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

interface Hijo {
  nombre: string
  fechaNacimiento: string
  edad: number
}

interface HijosFormQuestionProps extends StepComponentProps {
  numeroHijos: number
}

export function HijosFormQuestion({ value, onChange, numeroHijos }: HijosFormQuestionProps) {
  const [hijos, setHijos] = useState<Hijo[]>(
    value || Array.from({ length: numeroHijos }, () => ({
      nombre: '',
      fechaNacimiento: '',
      edad: 0,
    }))
  )

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

  const todosCompletos = hijos.every((hijo) => hijo.nombre && hijo.fechaNacimiento)

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
          </div>
        </div>
      ))}

      {!todosCompletos && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-black">
            Por favor completa la información de todos los hijos para continuar
          </p>
        </div>
      )}
    </div>
  )
}
