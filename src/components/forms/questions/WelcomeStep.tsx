'use client'

import { useEffect } from 'react'
import { StepComponentProps } from '../OneQuestionWizard'

export function WelcomeStep({ value, onChange }: StepComponentProps) {
  useEffect(() => {
    // Establecer valor automáticamente cuando se monta el componente
    if (!value) {
      onChange(true)
    }
  }, [value, onChange])

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
