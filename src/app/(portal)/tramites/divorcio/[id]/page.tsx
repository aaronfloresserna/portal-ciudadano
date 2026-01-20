'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { OneQuestionWizard } from '@/components/forms/OneQuestionWizard'
import { TextQuestion } from '@/components/forms/questions/TextQuestion'
import { DateQuestion } from '@/components/forms/questions/DateQuestion'
import { FileUploadQuestion } from '@/components/forms/questions/FileUploadQuestion'
import { YesNoQuestion } from '@/components/forms/questions/YesNoQuestion'
import { NumberQuestion } from '@/components/forms/questions/NumberQuestion'
import { WelcomeStep } from '@/components/forms/questions/WelcomeStep'

export default function DivorcioTramitePage() {
  const router = useRouter()
  const params = useParams()
  const tramiteId = params.id as string
  const token = useAuthStore((state) => state.token)
  const [tramite, setTramite] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Cargar el trámite
    fetch(`/api/tramites/${tramiteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTramite(data.tramite)
        }
      })
      .catch((err) => console.error('Error al cargar trámite:', err))
      .finally(() => setIsLoading(false))
  }, [tramiteId, token, router])

  const handleSave = async (step: number, data: any) => {
    const response = await fetch(`/api/tramites/${tramiteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pasoActual: step,
        datos: data,
      }),
    })

    if (!response.ok) {
      throw new Error('Error al guardar progreso')
    }
  }

  const handleComplete = async (data: any) => {
    // Marcar como completado
    await fetch(`/api/tramites/${tramiteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado: 'COMPLETADO',
        datos: data,
      }),
    })

    // Redirigir a confirmación
    router.push(`/tramites/divorcio/${tramiteId}/confirmacion`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando trámite...</p>
      </div>
    )
  }

  if (!tramite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Trámite no encontrado</p>
      </div>
    )
  }

  const steps = [
    // PASO 1: Bienvenida
    {
      id: 'bienvenida',
      title: '¡Bienvenido al trámite de Divorcio Voluntario!',
      description: 'Te guiaremos paso a paso para completar tu trámite de forma sencilla.',
      component: WelcomeStep,
    },

    // CÓNYUGE 1 (Pasos 2-6)
    {
      id: 'conyuge1_nombre',
      title: '¿Cuál es el nombre del primer cónyuge?',
      description: 'Solo el nombre o nombres (sin apellidos)',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: Juan Carlos" maxLength={100} />
      ),
    },
    {
      id: 'conyuge1_apellidos',
      title: '¿Cuáles son los apellidos del primer cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: García López" maxLength={100} />
      ),
    },
    {
      id: 'conyuge1_curp',
      title: 'CURP del primer cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: GACJ850615HDFRRN09" maxLength={18} />
      ),
    },
    {
      id: 'conyuge1_fechaNacimiento',
      title: 'Fecha de nacimiento del primer cónyuge',
      component: DateQuestion,
    },
    {
      id: 'conyuge1_ine',
      title: 'Sube la INE del primer cónyuge',
      description: 'Foto o escaneo de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_1"
          acceptedTypes="image/*"
        />
      ),
    },

    // CÓNYUGE 2 (Pasos 7-11)
    {
      id: 'conyuge2_nombre',
      title: '¿Cuál es el nombre del segundo cónyuge?',
      description: 'Solo el nombre o nombres (sin apellidos)',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: María Elena" maxLength={100} />
      ),
    },
    {
      id: 'conyuge2_apellidos',
      title: '¿Cuáles son los apellidos del segundo cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: Rodríguez Martínez" maxLength={100} />
      ),
    },
    {
      id: 'conyuge2_curp',
      title: 'CURP del segundo cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: ROME900812MDFRRL07" maxLength={18} />
      ),
    },
    {
      id: 'conyuge2_fechaNacimiento',
      title: 'Fecha de nacimiento del segundo cónyuge',
      component: DateQuestion,
    },
    {
      id: 'conyuge2_ine',
      title: 'Sube la INE del segundo cónyuge',
      description: 'Foto o escaneo de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_2"
          acceptedTypes="image/*"
        />
      ),
    },

    // MATRIMONIO (Pasos 12-14)
    {
      id: 'matrimonio_fecha',
      title: '¿Cuándo se casaron?',
      description: 'Fecha de celebración del matrimonio',
      component: DateQuestion,
    },
    {
      id: 'matrimonio_lugar',
      title: '¿Dónde se casaron?',
      description: 'Ciudad y Estado donde se celebró el matrimonio',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: Chihuahua, Chihuahua" maxLength={200} />
      ),
    },
    {
      id: 'matrimonio_tieneHijos',
      title: '¿Tienen hijos en común?',
      component: YesNoQuestion,
    },

    // Condicional: Si tienen hijos
    {
      id: 'matrimonio_numeroHijos',
      title: '¿Cuántos hijos tienen?',
      component: (props: any) => (
        <NumberQuestion {...props} min={1} max={20} placeholder="Número de hijos" />
      ),
      shouldShow: (data) => data.matrimonio_tieneHijos === true,
    },

    // DOMICILIO (Para el convenio)
    {
      id: 'domicilio_calle',
      title: 'Calle del domicilio para notificaciones',
      description: 'Domicilio donde recibirán notificaciones del trámite',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: Jacinto Roque Morón" maxLength={200} />
      ),
    },
    {
      id: 'domicilio_numero',
      title: 'Número del domicilio',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: 3803" maxLength={20} />
      ),
    },
    {
      id: 'domicilio_colonia',
      title: 'Colonia',
      component: (props: any) => (
        <TextQuestion {...props} placeholder="Ej: Santa Rita" maxLength={100} />
      ),
    },

    // DOCUMENTOS (Pasos 15-17)
    {
      id: 'doc_actaMatrimonio',
      title: 'Sube el acta de matrimonio',
      description: 'Documento original o copia certificada (PDF o foto)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="ACTA_MATRIMONIO"
          acceptedTypes="image/*,.pdf"
        />
      ),
    },
  ]

  return (
    <OneQuestionWizard
      steps={steps}
      tramiteId={tramiteId}
      initialData={tramite.datos || {}}
      onSave={handleSave}
      onComplete={handleComplete}
    />
  )
}
