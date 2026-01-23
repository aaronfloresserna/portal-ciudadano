'use client'

import { useState, useEffect } from 'react'
import { StepComponentProps } from '../OneQuestionWizard'
import { Input } from '@/components/ui/input'

export function PensionQuestion({ value, onChange, onNext, error, allData }: StepComponentProps) {
  const [monto, setMonto] = useState<number>(0)
  const [responsable, setResponsable] = useState<string>('')
  const [porcentajePadre, setPorcentajePadre] = useState<number>(50)
  const [porcentajeMadre, setPorcentajeMadre] = useState<number>(50)

  // Initialize from value
  useEffect(() => {
    if (value) {
      setMonto(value.monto || 0)
      setResponsable(value.responsable || '')
      setPorcentajePadre(value.porcentajePadre || 50)
      setPorcentajeMadre(value.porcentajeMadre || 50)
    }
  }, [])

  const handleMontoChange = (newMonto: number) => {
    setMonto(newMonto)
    updateValue(newMonto, responsable, porcentajePadre, porcentajeMadre)
  }

  const handleResponsableChange = (newResponsable: string) => {
    setResponsable(newResponsable)
    updateValue(monto, newResponsable, porcentajePadre, porcentajeMadre)
  }

  const handlePorcentajeChange = (padre: number, madre: number) => {
    setPorcentajePadre(padre)
    setPorcentajeMadre(madre)
    updateValue(monto, responsable, padre, madre)
  }

  const updateValue = (m: number, r: string, pPadre: number, pMadre: number) => {
    onChange({
      monto: m,
      responsable: r,
      porcentajePadre: r === 'Compartida' ? pPadre : undefined,
      porcentajeMadre: r === 'Compartida' ? pMadre : undefined,
    })
  }

  const options = [
    { value: 'Padre', label: 'El padre' },
    { value: 'Madre', label: 'La madre' },
    { value: 'Compartida', label: 'Compartida (especificar porcentajes)' },
  ]

  return (
    <div className="space-y-5">
      {/* Monto de pensión */}
      <div>
        <label className="block text-base font-semibold text-black mb-3">
          Monto mensual de la pensión alimenticia (MXN):
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500">
            $
          </span>
          <Input
            type="number"
            min="0"
            value={monto || ''}
            onChange={(e) => handleMontoChange(parseFloat(e.target.value) || 0)}
            className="text-lg py-6 pl-8"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Responsable */}
      <div>
        <label className="block text-base font-semibold text-black mb-3">
          ¿Quién será responsable de pagar esta pensión?
        </label>
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = responsable === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleResponsableChange(option.value)}
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
      </div>

      {/* Porcentajes cuando es Compartida */}
      {responsable === 'Compartida' && (
        <div className="mt-6 bg-tsj-secondary p-5 rounded-lg border-2 border-tsj-title">
          <p className="text-sm font-semibold text-tsj-title mb-4">
            Especifica el porcentaje que aportará cada padre:
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Padre: {porcentajePadre}% (${((monto * porcentajePadre) / 100).toFixed(2)} MXN)
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
                Madre: {porcentajeMadre}% (${((monto * porcentajeMadre) / 100).toFixed(2)} MXN)
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
                <strong>Total:</strong> ${((monto * porcentajePadre) / 100).toFixed(2)} (Padre) + $
                {((monto * porcentajeMadre) / 100).toFixed(2)} (Madre) = ${monto.toFixed(2)} MXN
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
