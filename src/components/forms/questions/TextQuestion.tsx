'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

interface TextQuestionProps extends StepComponentProps {
  maxLength?: number
  minLength?: number
  type?: 'text' | 'email' | 'tel'
  validateName?: boolean
  validateCURP?: boolean
}

export function TextQuestion({
  value,
  onChange,
  onNext,
  maxLength,
  minLength,
  type = 'text',
  validateName,
  validateCURP,
}: TextQuestionProps) {
  const [validationError, setValidationError] = useState<string>()

  const handleChange = (newValue: string) => {
    setValidationError(undefined)

    // Validar nombres (solo letras, espacios, acentos, ñ)
    if (validateName) {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      if (newValue && !nameRegex.test(newValue)) {
        setValidationError('Solo se permiten letras y espacios')
        return
      }
    }

    // Validar CURP (18 caracteres alfanuméricos en mayúsculas)
    if (validateCURP) {
      const curpRegex = /^[A-Z0-9]*$/
      const upperValue = newValue.toUpperCase()
      if (newValue && !curpRegex.test(upperValue)) {
        setValidationError('CURP solo debe contener letras mayúsculas y números')
        return
      }
      onChange(upperValue)
      return
    }

    onChange(newValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && !validationError) {
      if (minLength && value.length < minLength) {
        setValidationError(`Debe tener al menos ${minLength} caracteres`)
        return
      }
      onNext()
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength={maxLength}
        className="text-lg py-6"
        autoFocus
      />
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {maxLength && (
        <p className="text-sm text-black">
          {value?.length || 0} / {maxLength} caracteres
        </p>
      )}
      {minLength && (!value || value.length < minLength) && !validationError && (
        <p className="text-sm text-black">
          Mínimo {minLength} caracteres
        </p>
      )}
    </div>
  )
}
