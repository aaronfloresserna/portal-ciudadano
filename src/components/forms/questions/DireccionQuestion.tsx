'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

export function DireccionQuestion({ value, onChange }: StepComponentProps) {
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [colonia, setColonia] = useState('')

  // Initialize from value
  useEffect(() => {
    if (value) {
      setCalle(value.calle || '')
      setNumero(value.numero || '')
      setColonia(value.colonia || '')
    }
  }, [])

  const handleChange = (field: string, val: string) => {
    const newValue = {
      calle: field === 'calle' ? val : calle,
      numero: field === 'numero' ? val : numero,
      colonia: field === 'colonia' ? val : colonia,
    }

    if (field === 'calle') setCalle(val)
    if (field === 'numero') setNumero(val)
    if (field === 'colonia') setColonia(val)

    onChange(newValue)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-base font-semibold text-black mb-3">
          Calle
        </label>
        <Input
          type="text"
          value={calle}
          onChange={(e) => handleChange('calle', e.target.value)}
          className="text-lg py-6"
          maxLength={200}
          placeholder="Ej: Av. Juárez"
          required={false}
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-black mb-3">
          Número
        </label>
        <Input
          type="text"
          value={numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          className="text-lg py-6"
          maxLength={20}
          placeholder="Ej: 123"
          required={false}
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-black mb-3">
          Colonia
        </label>
        <Input
          type="text"
          value={colonia}
          onChange={(e) => handleChange('colonia', e.target.value)}
          className="text-lg py-6"
          maxLength={100}
          placeholder="Ej: Centro"
          required={false}
        />
      </div>
    </div>
  )
}
