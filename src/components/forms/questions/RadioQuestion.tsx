'use client'

import { StepComponentProps } from '../OneQuestionWizard'

interface RadioQuestionProps extends StepComponentProps {
  options: { value: string; label: string; description?: string }[]
}

export function RadioQuestion({ value, onChange, options }: RadioQuestionProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-tsj-title bg-tsj-primary'
                : 'border-gray-200 bg-white hover:border-tsj-secondary'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'border-tsj-title' : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-tsj-title" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-black">
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
