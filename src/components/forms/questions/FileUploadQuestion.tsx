'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { StepComponentProps } from '../OneQuestionWizard'

type UploadState = 'idle' | 'presigning' | 'uploading' | 'registering' | 'done' | 'error'

interface FileUploadQuestionProps extends StepComponentProps {
  tramiteId: string
  tipoDocumento: string
  acceptedTypes?: string
  maxSizeMB?: number
  presignEndpoint?: string
  registerEndpoint?: string
  extraHeaders?: Record<string, string>
}

export function FileUploadQuestion({
  value,
  onChange,
  tramiteId,
  tipoDocumento,
  acceptedTypes = 'image/*,.pdf',
  maxSizeMB = 20,
  presignEndpoint = '/api/documentos/presign',
  registerEndpoint = '/api/documentos',
  extraHeaders = {},
}: FileUploadQuestionProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [preview, setPreview] = useState<string | null>(value?.path || null)
  const [error, setError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAuthHeaders = (): Record<string, string> => {
    const stored = localStorage.getItem('auth-storage')
    const token = stored ? JSON.parse(stored).state?.token : null
    const headers: Record<string, string> = { ...extraHeaders }
    if (token && presignEndpoint === '/api/documentos/presign') {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  const uploadFile = async (file: File, attempt = 1): Promise<void> => {
    // Step 1: Get presigned PUT URL
    setUploadState('presigning')
    const authHeaders = getAuthHeaders()

    const presignRes = await fetch(presignEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        tramiteId,
        tipo: tipoDocumento,
        mimeType: file.type,
        size: file.size,
        nombreArchivo: file.name,
      }),
    })

    if (!presignRes.ok) {
      const err = await presignRes.json()
      throw new Error(err.error || 'Error al preparar la subida')
    }

    const { uploadUrl, key } = await presignRes.json()

    // Step 2: PUT file directly to S3
    setUploadState('uploading')
    const s3Res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!s3Res.ok) {
      if (s3Res.status === 403 && attempt === 1) {
        // URL expired — retry presign once
        return uploadFile(file, 2)
      }
      throw new Error(`Error al subir archivo (${s3Res.status})`)
    }

    // Step 3: Register in DB
    setUploadState('registering')
    const registerRes = await fetch(registerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        key,
        tramiteId,
        tipo: tipoDocumento,
        mimeType: file.type,
        size: file.size,
        nombreArchivo: file.name,
      }),
    })

    if (!registerRes.ok) {
      const err = await registerRes.json()
      throw new Error(err.error || 'Error al registrar documento')
    }

    const { documento } = await registerRes.json()
    onChange(documento)
    setUploadState('done')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(undefined)

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
      return
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview('pdf')
    }

    try {
      await uploadFile(file)
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo')
      setPreview(null)
      setUploadState('error')
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setUploadState('idle')
    setError(undefined)
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isLoading = ['presigning', 'uploading', 'registering'].includes(uploadState)

  const uploadStateLabel: Record<string, string> = {
    presigning: 'Preparando...',
    uploading: 'Subiendo archivo...',
    registering: 'Guardando...',
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedTypes}
        className="hidden"
        required={false}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!preview ? (
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">Click para subir</span>{' '}o arrastra aquí
            </div>
            <p className="text-xs text-gray-500">Imágenes (JPG, PNG) o PDF hasta {maxSizeMB}MB</p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          {preview !== 'pdf' ? (
            <img src={preview} alt="Preview" className="max-w-full h-auto rounded" />
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Documento PDF subido correctamente</p>
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="flex-1">
              Cambiar archivo
            </Button>
            <Button type="button" variant="destructive" onClick={handleRemove} disabled={isLoading}>
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-sm text-gray-600">
          {uploadStateLabel[uploadState] ?? 'Procesando...'}
        </div>
      )}
    </div>
  )
}
