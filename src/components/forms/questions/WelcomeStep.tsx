'use client'

import { useEffect } from 'react'
import { StepComponentProps } from '../OneQuestionWizard'

interface WelcomeStepProps extends StepComponentProps {
  customMessage?: string
}

export function WelcomeStep({ value, onChange, customMessage }: WelcomeStepProps) {
  useEffect(() => {
    // Establecer valor automáticamente cuando se monta el componente
    if (!value) {
      onChange(true)
    }
  }, [value, onChange])

  if (customMessage) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <svg
              className="w-8 h-8"
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
          </div>
          <p className="text-lg text-blue-900 font-medium">
            {customMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ¿Qué necesitas tener listo?
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• INE de ambos cónyuges (foto o escaneo)</li>
          <li>• Acta de matrimonio original (PDF o foto)</li>
          <li>• Convenio de divorcio firmado (PDF)</li>
          <li>• CURP de ambos cónyuges</li>
        </ul>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">
          Tiempo estimado
        </h3>
        <p className="text-sm text-green-800">
          Completar este formulario te tomará aproximadamente 15-20 minutos.
          Tu progreso se guarda automáticamente.
        </p>
      </div>
    </div>
  )
}
