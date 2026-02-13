'use client'

import { useState, useEffect } from 'react'
import { StepComponentProps } from '../OneQuestionWizard'

interface GastosQuestionProps extends StepComponentProps {
  tipo: 'medicos' | 'escolares'
}

export function GastosQuestion({ value, onChange, tipo, onNext, error, allData }: GastosQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [porcentajePadre, setPorcentajePadre] = useState<number>(50)
  const [porcentajeMadre, setPorcentajeMadre] = useState<number>(50)

  // Initialize from value
  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        setSelectedOption(value)
      } else if (typeof value === 'object' && value.tipo) {
        setSelectedOption(value.tipo)
        setPorcentajePadre(value.porcentajePadre || 50)
        setPorcentajeMadre(value.porcentajeMadre || 50)
      }
    }
  }, [])

  const handleOptionChange = (option: string) => {
    setSelectedOption(option)

    if (option === 'Compartida') {
      onChange({
        tipo: 'Compartida',
        porcentajePadre: porcentajePadre,
        porcentajeMadre: porcentajeMadre,
      })
    } else {
      onChange(option)
    }
  }

  const handlePorcentajeChange = (padre: number, madre: number) => {
    setPorcentajePadre(padre)
    setPorcentajeMadre(madre)

    onChange({
      tipo: 'Compartida',
      porcentajePadre: padre,
      porcentajeMadre: madre,
    })
  }

  const options = [
    { value: 'Padre', label: 'El padre en su 100%' },
    { value: 'Madre', label: 'La madre en su 100%' },
    { value: 'Compartida', label: 'Compartida (especificar porcentajes)' },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionChange(option.value)}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-tsj-title bg-tsj-primary'
                  : 'border-gray-200 bg-white hover:border-tsj-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-tsj-title' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-tsj-title" />
                  )}
                </div>
                <p className="text-base font-semibold text-black">
                  {option.label}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedOption === 'Compartida' && (
        <div className="mt-6 bg-tsj-secondary p-5 rounded-lg border-2 border-tsj-title">
          <p className="text-sm font-semibold text-tsj-title mb-4">
            Especifica el porcentaje de responsabilidad de cada padre:
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Padre: {porcentajePadre}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={porcentajePadre}
                onChange={(e) => {
                  const padre = parseInt(e.target.value)
                  const madre = 100 - padre
                  handlePorcentajeChange(padre, madre)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-tsj-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Madre: {porcentajeMadre}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={porcentajeMadre}
                onChange={(e) => {
                  const madre = parseInt(e.target.value)
                  const padre = 100 - madre
                  handlePorcentajeChange(padre, madre)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-tsj-title"
              />
            </div>

            <div className="mt-4 text-center text-sm text-black bg-white p-3 rounded-lg">
              <p>
                <strong>Total:</strong> {porcentajePadre}% (Padre) + {porcentajeMadre}% (Madre) = 100%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
