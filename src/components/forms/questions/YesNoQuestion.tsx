'use client'

import { Button } from '@/components/ui/button'
import { StepComponentProps } from '../OneQuestionWizard'

export function YesNoQuestion({ value, onChange, onNext }: StepComponentProps) {
  const handleSelect = (selected: boolean) => {
    onChange(selected)
    // Auto-avanzar después de seleccionar
    setTimeout(() => onNext(), 300)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant={value === true ? 'default' : 'outline'}
        onClick={() => handleSelect(true)}
        className="h-24 text-lg"
      >
        Sí
      </Button>
      <Button
        type="button"
        variant={value === false ? 'default' : 'outline'}
        onClick={() => handleSelect(false)}
        className="h-24 text-lg"
      >
        No
      </Button>
    </div>
  )
}
