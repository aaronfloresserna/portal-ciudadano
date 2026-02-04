'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { OneQuestionWizard } from '@/components/forms/OneQuestionWizard'
import { TextQuestion } from '@/components/forms/questions/TextQuestion'
import { DateQuestion } from '@/components/forms/questions/DateQuestion'
import { FileUploadQuestion } from '@/components/forms/questions/FileUploadQuestion'
import { WelcomeStep } from '@/components/forms/questions/WelcomeStep'
import { ReviewDataQuestion } from '@/components/forms/questions/ReviewDataQuestion'

export default function Conyuge2Page() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [invitacion, setInvitacion] = useState<any>(null)
  const [tramiteId, setTramiteId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verificarInvitacion = async () => {
      try {
        const response = await fetch(
          `/api/invitaciones/verificar?token=${token}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Invitación no válida o expirada')
        }

        setInvitacion(data.invitacion)
        setTramiteId(data.invitacion.tramiteId)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    verificarInvitacion()
  }, [token])

  const handleSave = async (step: number, data: any) => {
    // Guardar progreso usando el token (sin auth)
    const response = await fetch(`/api/tramites/${tramiteId}/conyuge2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Invitacion-Token': token,
      },
      body: JSON.stringify({
        datos: data,
      }),
    })

    if (!response.ok) {
      throw new Error('Error al guardar progreso')
    }
  }

  const handleComplete = async (data: any) => {
    // Marcar datos del cónyuge 2 como completados
    await fetch(`/api/tramites/${tramiteId}/conyuge2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Invitacion-Token': token,
      },
      body: JSON.stringify({
        datos: data,
        completado: true,
      }),
    })

    // Redirigir a página de confirmación
    router.push(`/conyuge2/confirmacion`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando invitación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación No Válida
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  // Construir las secciones de revisión si la modalidad es 'separado'
  const buildReviewSections = () => {
    const tramiteData = invitacion?.tramite?.datos || {}
    const sections = []

    // Sección: Datos del Matrimonio
    sections.push({
      title: 'Datos del Matrimonio',
      key: 'matrimonio',
      items: [
        { label: 'Fecha de matrimonio', value: tramiteData.matrimonio_fecha },
        { label: 'Estado donde se casaron', value: tramiteData.matrimonio_estado },
        { label: 'Ciudad donde se casaron', value: tramiteData.matrimonio_estado },
      ],
    })

    // Sección: Información sobre hijos
    if (tramiteData.matrimonio_tieneHijos) {
      sections.push({
        title: 'Información sobre Hijos',
        key: 'hijos',
        items: [
          { label: 'Tienen hijos en común', value: 'Sí' },
          { label: 'Número de hijos', value: tramiteData.matrimonio_numeroHijos },
          { label: 'Con quién vivirá el menor', value: tramiteData.menor_vivira_con },
          { label: 'Días de convivencia', value: tramiteData.convivencia_dias },
          { label: 'Convivencia en vacaciones', value: tramiteData.convivencia_vacaciones },
        ],
      })
    }

    // Sección: Gastos y Pensión
    if (tramiteData.matrimonio_tieneHijos) {
      sections.push({
        title: 'Gastos y Pensión Alimenticia',
        key: 'gastos',
        items: [
          { label: 'Responsable de gastos médicos', value: tramiteData.gastos_medicos },
          { label: 'Responsable de gastos escolares', value: tramiteData.gastos_escolares },
          { label: 'Monto de pensión alimenticia', value: tramiteData.pension_alimenticia_monto },
          { label: 'Responsable de pensión', value: tramiteData.pension_alimenticia_responsable },
        ],
      })
    }

    // Sección: Domicilio
    if (tramiteData.direccion_calle) {
      sections.push({
        title: 'Domicilio',
        key: 'domicilio',
        items: [
          { label: 'Calle', value: tramiteData.direccion_calle },
          { label: 'Número', value: tramiteData.direccion_numero },
          { label: 'Colonia', value: tramiteData.direccion_colonia },
        ],
      })
    }

    return sections
  }

  const steps = [
    {
      id: 'bienvenida',
      title: `¡Hola! ${invitacion?.solicitante?.nombre} te ha invitado a completar tus datos`,
      description: 'A continuación te pediremos tu información personal para continuar con el trámite de divorcio voluntario.',
      component: WelcomeStep,
    },
    // Paso de revisión (solo si modalidad es 'separado')
    ...(invitacion?.tramite?.datos?.modalidad_tramite === 'separado'
      ? [
          {
            id: 'revision_datos',
            title: 'Revisión de información proporcionada',
            description: 'Por favor revisa la información que el primer cónyuge ha proporcionado',
            component: (props: any) => (
              <ReviewDataQuestion {...props} sections={buildReviewSections()} />
            ),
          },
        ]
      : []),
    {
      id: 'conyuge2_nombre',
      title: '¿Cuál es tu nombre?',
      description: 'Solo el nombre o nombres (sin apellidos)',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
    },
    {
      id: 'conyuge2_apellido_paterno',
      title: '¿Cuál es tu apellido paterno?',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={50} validateName />
      ),
    },
    {
      id: 'conyuge2_apellido_materno',
      title: '¿Cuál es tu apellido materno?',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={50} validateName />
      ),
    },
    {
      id: 'conyuge2_curp',
      title: 'Tu CURP',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={18} minLength={18} validateCURP />
      ),
    },
    {
      id: 'conyuge2_fechaNacimiento',
      title: 'Tu fecha de nacimiento',
      component: DateQuestion,
    },
    {
      id: 'conyuge2_ine_frontal',
      title: 'Sube la parte frontal de tu INE',
      description: 'Foto o escaneo de la parte frontal de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_2_FRONTAL"
          acceptedTypes="image/*"
          uploadUrl="/api/documentos/public"
          headers={{ 'X-Invitacion-Token': token }}
        />
      ),
    },
    {
      id: 'conyuge2_ine_trasera',
      title: 'Sube la parte trasera de tu INE',
      description: 'Foto o escaneo de la parte trasera de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_2_TRASERA"
          acceptedTypes="image/*"
          uploadUrl="/api/documentos/public"
          headers={{ 'X-Invitacion-Token': token }}
        />
      ),
    },
    {
      id: 'conyuge2_correo',
      title: 'Tu correo electrónico',
      description: 'Correo electrónico para recibir notificaciones del trámite',
      component: (props: any) => (
        <TextQuestion {...props} type="email" maxLength={100} />
      ),
    },
  ]

  return (
    <OneQuestionWizard
      steps={steps}
      tramiteId={tramiteId}
      initialData={{}}
      onSave={handleSave}
      onComplete={handleComplete}
    />
  )
}
