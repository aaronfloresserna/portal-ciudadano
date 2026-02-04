'use client'

import { useState } from 'react'
import { StepComponentProps } from '../OneQuestionWizard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DataSection {
  title: string
  items: { label: string; value: any }[]
  key: string
}

interface ReviewDataQuestionProps extends StepComponentProps {
  sections: DataSection[]
}

export function ReviewDataQuestion({
  value,
  onChange,
  onNext,
  sections,
  allData,
}: ReviewDataQuestionProps) {
  const [reviewStatus, setReviewStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>(
    value || {}
  )
  const [comments, setComments] = useState<Record<string, string>>(
    allData?.review_comments || {}
  )
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null)

  const handleAccept = (sectionKey: string) => {
    const newStatus = { ...reviewStatus, [sectionKey]: 'accepted' as const }
    setReviewStatus(newStatus)
    onChange(newStatus)
  }

  const handleReject = (sectionKey: string) => {
    const newStatus = { ...reviewStatus, [sectionKey]: 'rejected' as const }
    setReviewStatus(newStatus)
    onChange(newStatus)
    setShowCommentFor(sectionKey)
  }

  const handleCommentChange = (sectionKey: string, comment: string) => {
    const newComments = { ...comments, [sectionKey]: comment }
    setComments(newComments)
  }

  const handleCommentSave = (sectionKey: string) => {
    setShowCommentFor(null)
    // Store comments in allData
    if (allData) {
      allData.review_comments = comments
    }
  }

  const allReviewed = sections.every(
    (section) => reviewStatus[section.key] === 'accepted' || reviewStatus[section.key] === 'rejected'
  )

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'No especificado'
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Revisión de Información
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Por favor revisa cuidadosamente la información proporcionada por el primer cónyuge.
              Puedes aceptar o rechazar cada sección. Si rechazas alguna sección, podrás agregar comentarios explicando el motivo.
            </p>
          </div>
        </div>
      </div>

      {sections.map((section) => {
        const status = reviewStatus[section.key]
        const hasComment = comments[section.key]

        return (
          <Card key={section.key} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              {status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {status === 'accepted' ? '✓ Aceptado' : '✗ Rechazado'}
                </span>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {section.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                  <span className="text-sm text-gray-900 text-right max-w-md">
                    {formatValue(item.value)}
                  </span>
                </div>
              ))}
            </div>

            {status === 'rejected' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="block text-sm font-medium text-red-900 mb-2">
                  Motivo del rechazo:
                </label>
                {showCommentFor === section.key ? (
                  <div>
                    <textarea
                      value={comments[section.key] || ''}
                      onChange={(e) => handleCommentChange(section.key, e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Explica por qué rechazas esta información..."
                    />
                    <button
                      onClick={() => handleCommentSave(section.key)}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Guardar comentario
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-800">{hasComment || 'Sin comentarios'}</p>
                    <button
                      onClick={() => setShowCommentFor(section.key)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Editar comentario
                    </button>
                  </div>
                )}
              </div>
            )}

            {!status && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleAccept(section.key)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  ✓ Aceptar
                </button>
                <button
                  onClick={() => handleReject(section.key)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  ✗ Rechazar
                </button>
              </div>
            )}

            {status && (
              <button
                onClick={() => {
                  const newStatus = { ...reviewStatus }
                  delete newStatus[section.key]
                  setReviewStatus(newStatus)
                  onChange(newStatus)
                }}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
              >
                Cambiar decisión
              </button>
            )}
          </Card>
        )
      })}

      {allReviewed && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onNext}
            className="px-8 py-3 bg-tsj-primary text-white rounded-lg font-medium hover:bg-tsj-secondary"
          >
            Continuar con mis datos personales
          </Button>
        </div>
      )}
    </div>
  )
}
