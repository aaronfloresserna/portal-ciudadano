'use client'

import { Input } from '@/components/ui/input'
import { StepComponentProps } from '../OneQuestionWizard'

export function DateQuestion({ value, onChange }: StepComponentProps) {
  return (
    <div className="space-y-4">
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-lg py-6"
        autoFocus
      />
    </div>
  )
}
