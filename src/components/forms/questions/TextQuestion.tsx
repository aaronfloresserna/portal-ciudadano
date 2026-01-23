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
  helpText?: string
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
  helpText,
}: TextQuestionProps) {
  const [validationError, setValidationError] = useState<string>()
  const [showHelp, setShowHelp] = useState(false)

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
      {helpText && (
        <div className="bg-tsj-secondary border-l-4 border-tsj-title p-4 rounded-r-lg mb-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-tsj-title flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-tsj-title mb-1">Ejemplo:</p>
              <p className="text-sm text-black">{helpText}</p>
            </div>
          </div>
        </div>
      )}
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
