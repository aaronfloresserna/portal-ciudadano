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
import { SignatureQuestion } from '@/components/forms/questions/SignatureQuestion'
import { HijosFormQuestion } from '@/components/forms/questions/HijosFormQuestion'

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
        <TextQuestion {...props} maxLength={100} validateName />
      ),
    },
    {
      id: 'conyuge1_apellidos',
      title: '¿Cuáles son los apellidos del primer cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
    },
    {
      id: 'conyuge1_curp',
      title: 'CURP del primer cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={18} minLength={18} validateCURP />
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
        <TextQuestion {...props} maxLength={100} validateName />
      ),
    },
    {
      id: 'conyuge2_apellidos',
      title: '¿Cuáles son los apellidos del segundo cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
    },
    {
      id: 'conyuge2_curp',
      title: 'CURP del segundo cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={18} minLength={18} validateCURP />
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
        <TextQuestion {...props} maxLength={200} />
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
        <NumberQuestion {...props} min={1} max={20} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Formulario de datos de cada hijo
    {
      id: 'hijos_datos',
      title: 'Información de los hijos',
      description: 'Por favor proporciona los datos de cada hijo',
      component: (props: any) => (
        <HijosFormQuestion
          {...props}
          numeroHijos={tramite?.datos?.matrimonio_numeroHijos || 1}
          tramiteId={tramiteId}
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true && data.matrimonio_numeroHijos > 0,
    },

    // Guardia y custodia (solo si tienen hijos)
    {
      id: 'guardia_custodia',
      title: '¿Cómo será la guardia y custodia de los hijos?',
      description: 'Por ejemplo: Compartida, Con el padre, Con la madre',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={200} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Convivencia - Días específicos
    {
      id: 'convivencia_dias',
      title: '¿Qué días convivirá el menor con cada padre?',
      description: 'Especifica días de la semana, fines de semana, etc.',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={500} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Convivencia - Horarios
    {
      id: 'convivencia_horarios',
      title: '¿Cuáles serán los horarios de entrega y recogida del menor?',
      description: 'Horarios específicos para la entrega y recogida',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={300} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Convivencia - Vacaciones
    {
      id: 'convivencia_vacaciones',
      title: '¿Cómo será la convivencia en vacaciones y días festivos?',
      description: 'Vacaciones escolares, navidad, semana santa, etc.',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={500} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Gastos médicos
    {
      id: 'gastos_medicos',
      title: '¿Quién será responsable de los gastos médicos?',
      description: 'Especifica cómo se dividirán los gastos médicos',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={300} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Gastos escolares
    {
      id: 'gastos_escolares',
      title: '¿Quién será responsable de los gastos escolares?',
      description: 'Especifica cómo se dividirán los gastos escolares',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={300} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Pensión alimenticia - Monto
    {
      id: 'pension_monto',
      title: '¿Cuál será el monto de la pensión alimenticia mensual?',
      description: 'Monto en pesos mexicanos (MXN)',
      component: (props: any) => (
        <NumberQuestion {...props} min={0} max={1000000} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // Pensión alimenticia - Responsable
    {
      id: 'pension_responsable',
      title: '¿Quién será responsable de pagar la pensión alimenticia?',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={200} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
    },

    // DOMICILIO (Para el convenio)
    {
      id: 'domicilio_calle',
      title: 'Calle del domicilio para notificaciones',
      description: 'Domicilio donde recibirán notificaciones del trámite',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={200} />
      ),
    },
    {
      id: 'domicilio_numero',
      title: 'Número del domicilio',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={20} />
      ),
    },
    {
      id: 'domicilio_colonia',
      title: 'Colonia',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} />
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

    // FIRMAS (Pasos 18-20)
    {
      id: 'firma_conyuge1',
      title: `Firma del primer cónyuge`,
      description: 'Se grabará tu imagen mientras firmas como evidencia legal',
      component: SignatureQuestion,
    },
    {
      id: 'aviso_firma_conyuge2',
      title: 'Turno del segundo cónyuge',
      description: 'Por favor, pasa el dispositivo al segundo cónyuge para que pueda firmar.',
      component: (props: any) => (
        <WelcomeStep
          {...props}
          customMessage="Ahora es momento de que el segundo cónyuge firme el convenio. Por favor entrega el dispositivo para continuar."
        />
      ),
    },
    {
      id: 'firma_conyuge2',
      title: `Firma del segundo cónyuge`,
      description: 'Se grabará tu imagen mientras firmas como evidencia legal',
      component: SignatureQuestion,
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
