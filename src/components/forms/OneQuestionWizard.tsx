'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Step {
  id: string
  title: string
  description?: string
  component: React.ComponentType<StepComponentProps>
  shouldShow?: (data: any) => boolean
}

export interface StepComponentProps {
  value: any
  onChange: (value: any) => void
  onNext: () => void
  error?: string
}

interface OneQuestionWizardProps {
  steps: Step[]
  tramiteId: string
  initialData?: any
  onComplete: (data: any) => void
  onSave?: (step: number, data: any) => Promise<void>
}

export function OneQuestionWizard({
  steps,
  tramiteId,
  initialData = {},
  onComplete,
  onSave,
}: OneQuestionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<any>(initialData)
  const [error, setError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const dataRef = useRef<any>(initialData)

  const step = steps[currentStep]
  const CurrentComponent = step.component

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleValueChange = (value: any) => {
    const newData = { ...dataRef.current, [step.id]: value }
    dataRef.current = newData
    setData(newData)
    setError(undefined)
  }

  const findNextVisibleStep = (fromStep: number, currentData: any): number => {
    for (let i = fromStep + 1; i < steps.length; i++) {
      if (!steps[i].shouldShow || steps[i].shouldShow!(currentData)) {
        return i
      }
    }
    return steps.length // No more steps
  }

  const findPreviousVisibleStep = (fromStep: number, currentData: any): number => {
    for (let i = fromStep - 1; i >= 0; i--) {
      if (!steps[i].shouldShow || steps[i].shouldShow!(currentData)) {
        return i
      }
    }
    return 0
  }

  const handleNext = async () => {
    setError(undefined)
    setIsSaving(true)

    try {
      const currentData = dataRef.current

      // Guardar progreso
      if (onSave) {
        await onSave(currentStep + 1, currentData)
      }

      // Si es el último paso, completar
      if (currentStep === steps.length - 1) {
        onComplete(currentData)
      } else {
        const nextStep = findNextVisibleStep(currentStep, currentData)
        if (nextStep >= steps.length) {
          onComplete(currentData)
        } else {
          setCurrentStep(nextStep)
          window.scrollTo(0, 0)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const currentData = dataRef.current
      const prevStep = findPreviousVisibleStep(currentStep, currentData)
      setCurrentStep(prevStep)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-black">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-black">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{step.title}</CardTitle>
            {step.description && (
              <CardDescription>{step.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <CurrentComponent
              value={data[step.id]}
              onChange={handleValueChange}
              onNext={handleNext}
              error={error}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSaving}
            className="w-32"
          >
            ← Atrás
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!data[step.id] || isSaving}
            className="w-32"
          >
            {isSaving
              ? 'Guardando...'
              : currentStep === steps.length - 1
              ? 'Finalizar'
              : 'Siguiente →'}
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-black mt-6">
          Tu progreso se guarda automáticamente. Puedes regresar en cualquier momento.
        </p>
      </div>
    </div>
  )
}
