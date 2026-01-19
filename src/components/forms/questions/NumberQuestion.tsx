'use client'

import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

interface NumberQuestionProps extends StepComponentProps {
  min?: number
  max?: number
  placeholder?: string
}

export function NumberQuestion({
  value,
  onChange,
  onNext,
  min = 0,
  max,
  placeholder,
}: NumberQuestionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value !== undefined && value !== null) {
      onNext()
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        onKeyPress={handleKeyPress}
        min={min}
        max={max}
        placeholder={placeholder}
        className="text-lg py-6"
        autoFocus
      />
      {min !== undefined && max !== undefined && (
        <p className="text-sm text-gray-500">
          Debe ser un número entre {min} y {max}
        </p>
      )}
    </div>
  )
}
