'use client'

import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { StepComponentProps } from '../OneQuestionWizard'

export function SignatureQuestion({ value, onChange, onNext }: StepComponentProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>()
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Activar cámara al montar el componente
    startCamera()

    // Limpiar al desmontar
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        streamRef.current = mediaStream
        setCameraActive(true)
      }
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err)
      setError('No se pudo acceder a la cámara. Por favor permite el acceso.')
    }
  }

  const stopCamera = () => {
    const currentStream = streamRef.current || stream
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop()
        console.log('Cámara apagada')
      })
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setStream(null)
      streamRef.current = null
      setCameraActive(false)
    }
  }

  const handleClear = () => {
    sigCanvas.current?.clear()
    onChange(null)
  }

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL('image/png')
      onChange(signatureData)
    }
  }

  // Guardar automáticamente cuando se dibuja
  const handleEnd = () => {
    handleSave()
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <div>
            <p className="font-medium text-blue-900">
              Se está grabando tu imagen mientras firmas
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Esta grabación es con fines de validación legal del trámite.
              Dibuja tu firma en el recuadro blanco.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Video de la cámara */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Cámara {cameraActive && <span className="text-red-600">● REC</span>}
          </label>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <p className="text-white text-sm">Activando cámara...</p>
              </div>
            )}
          </div>
        </div>

        {/* Canvas para la firma */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Dibuja tu firma aquí
          </label>
          <div className="border-2 border-gray-300 rounded-lg bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-48 md:h-full',
              }}
              onEnd={handleEnd}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="w-full"
          >
            Limpiar firma
          </Button>
        </div>
      </div>

      {/* Previsualización de la firma */}
      {value && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Firma capturada:
          </p>
          <img
            src={value}
            alt="Firma"
            className="max-w-xs border border-gray-300 bg-white p-2 rounded"
          />
        </div>
      )}
    </div>
  )
}
