'use client'

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Datos Enviados Correctamente!
        </h2>
        <p className="text-gray-600 mb-6">
          Tus datos personales han sido guardados exitosamente. El solicitante ha sido notificado y continuarán juntos con el resto del trámite.
        </p>
        <p className="text-sm text-gray-500">
          Puedes cerrar esta ventana.
        </p>
      </div>
    </div>
  )
}
