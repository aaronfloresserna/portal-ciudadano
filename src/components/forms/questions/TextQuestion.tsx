'use client'

import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

interface TextQuestionProps extends StepComponentProps {
  placeholder?: string
  maxLength?: number
  type?: 'text' | 'email' | 'tel'
}

export function TextQuestion({
  value,
  onChange,
  onNext,
  placeholder,
  maxLength,
  type = 'text',
}: TextQuestionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onNext()
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        maxLength={maxLength}
        className="text-lg py-6"
        autoFocus
      />
      {maxLength && (
        <p className="text-sm text-gray-500">
          {value?.length || 0} / {maxLength} caracteres
        </p>
      )}
    </div>
  )
}
