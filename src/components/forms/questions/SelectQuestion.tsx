'use client'

import { StepComponentProps } from '../OneQuestionWizard'
import { Label } from '@/components/ui/label'

interface SelectQuestionProps extends StepComponentProps {
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SelectQuestion({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción'
}: SelectQuestionProps) {
  return (
    <div className="space-y-4">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 px-4 text-base rounded-lg border-2 border-gray-200 focus:border-tsj-title focus:outline-none bg-white"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
