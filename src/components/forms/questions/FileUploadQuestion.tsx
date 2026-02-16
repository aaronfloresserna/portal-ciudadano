'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { StepComponentProps } from '../OneQuestionWizard'

interface FileUploadQuestionProps extends StepComponentProps {
  tramiteId: string
  tipoDocumento: string
  acceptedTypes?: string
  maxSizeMB?: number
  uploadUrl?: string
  headers?: Record<string, string>
}

export function FileUploadQuestion({
  value,
  onChange,
  tramiteId,
  tipoDocumento,
  acceptedTypes = 'image/*,.pdf',
  maxSizeMB = 10,
  uploadUrl = '/api/documentos',
  headers = {},
}: FileUploadQuestionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value?.path || null)
  const [error, setError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(undefined)

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
      return
    }

    // Mostrar preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Subir archivo
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tramiteId', tramiteId)
      formData.append('tipo', tipoDocumento)

      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
        : null

      const requestHeaders: Record<string, string> = {
        ...headers,
      }

      // Solo agregar Authorization si hay token y no es upload público
      if (token && uploadUrl === '/api/documentos') {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir archivo')
      }

      onChange(data.documento)
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedTypes}
        className="hidden"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!preview ? (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click para subir
              </span>{' '}
              o arrastra aquí
            </div>
            <p className="text-xs text-gray-500">
              Imágenes (JPG, PNG) o PDF hasta {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          {preview.startsWith('data:image') || preview.endsWith('.jpg') || preview.endsWith('.png') ? (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Documento PDF subido correctamente
                </p>
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={isUploading}
              className="flex-1"
            >
              Cambiar archivo
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Subiendo archivo...
        </div>
      )}
    </div>
  )
}
