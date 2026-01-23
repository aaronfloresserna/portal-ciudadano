'use client'

import { StepComponentProps } from '../OneQuestionWizard'

interface CheckboxGroupQuestionProps extends StepComponentProps {
  options: { value: string; label: string }[]
}

export function CheckboxGroupQuestion({
  value,
  onChange,
  options,
  onNext,
  error,
  allData,
}: CheckboxGroupQuestionProps) {
  const selectedValues = value || []

  const handleToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v: string) => v !== optionValue)
      : [...selectedValues, optionValue]

    onChange(newValues)
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value)

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-tsj-title bg-tsj-primary text-black'
                : 'border-gray-200 bg-white hover:border-tsj-secondary'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-tsj-title bg-white'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-tsj-title"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-base font-medium">{option.label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
