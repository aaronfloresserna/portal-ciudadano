'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Step {
  id: string
  title: string | ((data: any) => string)
  description?: string
  component: React.ComponentType<StepComponentProps>
  shouldShow?: (data: any) => boolean
  optional?: boolean
}

export interface StepComponentProps {
  value: any
  onChange: (value: any) => void
  onNext: () => void
  error?: string
  allData?: any
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

    const currentData = dataRef.current
    const currentStepData = currentData[step.id]

    // Validación especial para CURP - debe tener exactamente 18 caracteres
    if (step.id.includes('curp') && currentStepData) {
      if (typeof currentStepData === 'string' && currentStepData.length !== 18) {
        setError('El CURP debe tener exactamente 18 caracteres')
        return
      }
    }

    setIsSaving(true)

    try {
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
    <div className="min-h-screen bg-tsj-bg py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-semibold text-tsj-title">
              {Math.round(progress)}% completado
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div
              className="bg-tsj-title h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-black font-bold">
              {typeof step.title === 'function' ? step.title(data) : step.title}
            </CardTitle>
            {step.description && (
              <CardDescription className="text-black">{step.description}</CardDescription>
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
              allData={dataRef.current}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSaving}
            className="px-8 py-6 text-base"
          >
            ← Atrás
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={(!data[step.id] && !step.optional) || isSaving}
            className="px-8 py-6 text-base"
          >
            {isSaving
              ? 'Guardando...'
              : currentStep === steps.length - 1
              ? 'Finalizar'
              : 'Siguiente →'}
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Tu progreso se guarda automáticamente. Puedes regresar en cualquier momento.
        </p>
      </div>
    </div>
  )
}
