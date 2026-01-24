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
import { SelectQuestion } from '@/components/forms/questions/SelectQuestion'
import { CheckboxGroupQuestion } from '@/components/forms/questions/CheckboxGroupQuestion'
import { RadioQuestion } from '@/components/forms/questions/RadioQuestion'
import { GastosQuestion } from '@/components/forms/questions/GastosQuestion'
import { PensionQuestion } from '@/components/forms/questions/PensionQuestion'

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
    const miRol = tramite.miRol
    const estado = tramite.estado

    // Verificar si el usuario está completando sus datos personales
    const esCompletandoDatosPersonales =
      (miRol === 'SOLICITANTE' && !tramite.conyuge1Completado) ||
      (miRol === 'CONYUGE' && !tramite.conyuge2Completado)

    if (esCompletandoDatosPersonales) {
      // Marcar datos como completados
      await fetch(`/api/tramites/${tramiteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          datos: data,
          marcarDatosCompletados: true,
        }),
      })

      // Redirigir según rol
      if (miRol === 'SOLICITANTE') {
        router.push(`/tramites/divorcio/${tramiteId}/invitar`)
      } else {
        router.push(`/tramites/divorcio/${tramiteId}/confirmacion`)
      }
    } else {
      // Completar el trámite completo
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

  const allSteps = [
    // PASO 1: Bienvenida
    {
      id: 'bienvenida',
      title: '¡Bienvenido al trámite de Divorcio Voluntario!',
      description: 'Te guiaremos paso a paso para completar tu trámite de forma sencilla.',
      component: WelcomeStep,
      rol: null, // Visible para todos
    },

    // CÓNYUGE 1 (Pasos 2-6)
    {
      id: 'conyuge1_nombre',
      title: '¿Cuál es el nombre del primer cónyuge?',
      description: 'Solo el nombre o nombres (sin apellidos)',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
      rol: 'SOLICITANTE',
    },
    {
      id: 'conyuge1_apellidos',
      title: '¿Cuáles son los apellidos del primer cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
      rol: 'SOLICITANTE',
    },
    {
      id: 'conyuge1_curp',
      title: 'CURP del primer cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={18} minLength={18} validateCURP />
      ),
      rol: 'SOLICITANTE',
    },
    {
      id: 'conyuge1_fechaNacimiento',
      title: 'Fecha de nacimiento del primer cónyuge',
      component: DateQuestion,
      rol: 'SOLICITANTE',
    },
    {
      id: 'conyuge1_ine_frontal',
      title: 'Sube la parte frontal de la INE del primer cónyuge',
      description: 'Foto o escaneo de la parte frontal de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_1_FRONTAL"
          acceptedTypes="image/*"
        />
      ),
      rol: 'SOLICITANTE',
    },
    {
      id: 'conyuge1_ine_trasera',
      title: 'Sube la parte trasera de la INE del primer cónyuge',
      description: 'Foto o escaneo de la parte trasera de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_1_TRASERA"
          acceptedTypes="image/*"
        />
      ),
      rol: 'SOLICITANTE',
    },

    // CÓNYUGE 2 (Pasos 7-11)
    {
      id: 'conyuge2_nombre',
      title: '¿Cuál es el nombre del segundo cónyuge?',
      description: 'Solo el nombre o nombres (sin apellidos)',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
      rol: 'CONYUGE',
    },
    {
      id: 'conyuge2_apellidos',
      title: '¿Cuáles son los apellidos del segundo cónyuge?',
      description: 'Apellido paterno y materno',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} validateName />
      ),
      rol: 'CONYUGE',
    },
    {
      id: 'conyuge2_curp',
      title: 'CURP del segundo cónyuge',
      description: '18 caracteres que aparecen en la identificación oficial',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={18} minLength={18} validateCURP />
      ),
      rol: 'CONYUGE',
    },
    {
      id: 'conyuge2_fechaNacimiento',
      title: 'Fecha de nacimiento del segundo cónyuge',
      component: DateQuestion,
      rol: 'CONYUGE',
    },
    {
      id: 'conyuge2_ine_frontal',
      title: 'Sube la parte frontal de la INE del segundo cónyuge',
      description: 'Foto o escaneo de la parte frontal de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_2_FRONTAL"
          acceptedTypes="image/*"
        />
      ),
      rol: 'CONYUGE',
    },
    {
      id: 'conyuge2_ine_trasera',
      title: 'Sube la parte trasera de la INE del segundo cónyuge',
      description: 'Foto o escaneo de la parte trasera de la identificación oficial (INE o IFE)',
      component: (props: any) => (
        <FileUploadQuestion
          {...props}
          tramiteId={tramiteId}
          tipoDocumento="INE_CONYUGE_2_TRASERA"
          acceptedTypes="image/*"
        />
      ),
      rol: 'CONYUGE',
    },

    // MATRIMONIO (Pasos 12-14)
    {
      id: 'matrimonio_fecha',
      title: '¿Cuándo se casaron?',
      description: 'Fecha de celebración del matrimonio',
      component: DateQuestion,
      rol: null,
    },
    {
      id: 'matrimonio_ciudad',
      title: '¿En qué ciudad se casaron?',
      description: 'Ciudad donde se celebró el matrimonio',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} />
      ),
      rol: null,
    },
    {
      id: 'matrimonio_estado',
      title: '¿En qué estado se casaron?',
      description: 'Estado de la República Mexicana donde se celebró el matrimonio',
      component: (props: any) => (
        <SelectQuestion
          {...props}
          options={[
            { value: 'Aguascalientes', label: 'Aguascalientes' },
            { value: 'Baja California', label: 'Baja California' },
            { value: 'Baja California Sur', label: 'Baja California Sur' },
            { value: 'Campeche', label: 'Campeche' },
            { value: 'Chiapas', label: 'Chiapas' },
            { value: 'Chihuahua', label: 'Chihuahua' },
            { value: 'Coahuila', label: 'Coahuila' },
            { value: 'Colima', label: 'Colima' },
            { value: 'Ciudad de México', label: 'Ciudad de México' },
            { value: 'Durango', label: 'Durango' },
            { value: 'Guanajuato', label: 'Guanajuato' },
            { value: 'Guerrero', label: 'Guerrero' },
            { value: 'Hidalgo', label: 'Hidalgo' },
            { value: 'Jalisco', label: 'Jalisco' },
            { value: 'Estado de México', label: 'Estado de México' },
            { value: 'Michoacán', label: 'Michoacán' },
            { value: 'Morelos', label: 'Morelos' },
            { value: 'Nayarit', label: 'Nayarit' },
            { value: 'Nuevo León', label: 'Nuevo León' },
            { value: 'Oaxaca', label: 'Oaxaca' },
            { value: 'Puebla', label: 'Puebla' },
            { value: 'Querétaro', label: 'Querétaro' },
            { value: 'Quintana Roo', label: 'Quintana Roo' },
            { value: 'San Luis Potosí', label: 'San Luis Potosí' },
            { value: 'Sinaloa', label: 'Sinaloa' },
            { value: 'Sonora', label: 'Sonora' },
            { value: 'Tabasco', label: 'Tabasco' },
            { value: 'Tamaulipas', label: 'Tamaulipas' },
            { value: 'Tlaxcala', label: 'Tlaxcala' },
            { value: 'Veracruz', label: 'Veracruz' },
            { value: 'Yucatán', label: 'Yucatán' },
            { value: 'Zacatecas', label: 'Zacatecas' },
          ]}
          placeholder="Selecciona el estado"
        />
      ),
      rol: null,
    },
    {
      id: 'matrimonio_tieneHijos',
      title: '¿Tienen hijos en común?',
      component: YesNoQuestion,
      rol: null,
    },

    // Condicional: Si tienen hijos
    {
      id: 'matrimonio_numeroHijos',
      title: '¿Cuántos hijos tienen?',
      component: (props: any) => (
        <NumberQuestion {...props} min={1} max={20} />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Formulario de datos de cada hijo
    {
      id: 'hijos_datos',
      title: 'Información de los hijos',
      description: 'Por favor proporciona los datos de cada hijo',
      component: (props: any) => (
        <HijosFormQuestion
          {...props}
          numeroHijos={props.allData?.matrimonio_numeroHijos || 1}
          tramiteId={tramiteId}
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true && data.matrimonio_numeroHijos > 0,
      rol: null,
    },

    // Nota: guardia_custodia siempre es "Compartida" en divorcio voluntario

    // ¿Con quién vivirá el menor?
    {
      id: 'menor_vivira_con',
      title: '¿Con quién vivirá el menor habitualmente?',
      description: 'Especifica con cuál de los padres vivirá el menor la mayor parte del tiempo',
      component: (props: any) => (
        <SelectQuestion
          {...props}
          options={[
            { value: 'Padre', label: 'Con el padre' },
            { value: 'Madre', label: 'Con la madre' },
            { value: 'Ambos', label: 'Con ambos (semanas alternas)' },
          ]}
          placeholder="Selecciona una opción"
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Convivencia - Días específicos
    {
      id: 'convivencia_dias',
      title: '¿Qué días convivirá el menor con cada padre?',
      description: 'Selecciona los días de la semana (puedes seleccionar múltiples opciones)',
      component: (props: any) => (
        <CheckboxGroupQuestion
          {...props}
          options={[
            { value: 'lunes', label: 'Lunes' },
            { value: 'martes', label: 'Martes' },
            { value: 'miercoles', label: 'Miércoles' },
            { value: 'jueves', label: 'Jueves' },
            { value: 'viernes', label: 'Viernes' },
            { value: 'sabado', label: 'Sábado' },
            { value: 'domingo', label: 'Domingo' },
            { value: 'fines_semana', label: 'Fines de semana alternos' },
            { value: 'semanas_alternas', label: 'Semanas alternas' },
          ]}
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Convivencia - Horarios
    {
      id: 'convivencia_horarios',
      title: '¿Cuáles serán los horarios de entrega y recogida del menor?',
      description: 'Horarios específicos para la entrega y recogida',
      component: (props: any) => (
        <TextQuestion
          {...props}
          maxLength={300}
          helpText="Ejemplo: Viernes a las 18:00 hrs se entregará al padre, y domingo a las 20:00 hrs se devolverá a la madre."
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Convivencia - Vacaciones
    {
      id: 'convivencia_vacaciones',
      title: '¿Cómo será la convivencia en vacaciones y días festivos?',
      description: 'Selecciona el régimen de convivencia para vacaciones escolares, navidad, semana santa, etc.',
      component: (props: any) => (
        <RadioQuestion
          {...props}
          options={[
            {
              value: 'Compartida',
              label: 'Compartida',
              description: 'Los menores convivirán de manera equitativa con ambos padres durante los períodos vacacionales, dividiéndose el tiempo de forma proporcional.',
            },
            {
              value: 'Alternada',
              label: 'Alternada',
              description: 'Los menores convivirán con cada padre en períodos vacacionales alternados (un año con el padre, el siguiente con la madre).',
            },
          ]}
        />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Gastos médicos
    {
      id: 'gastos_medicos',
      title: '¿Quién será responsable de los gastos médicos del menor?',
      description: 'Selecciona quién cubrirá los gastos médicos (consultas, medicamentos, emergencias, etc.)',
      component: (props: any) => (
        <GastosQuestion {...props} tipo="medicos" />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Gastos escolares
    {
      id: 'gastos_escolares',
      title: '¿Quién será responsable de los gastos escolares del menor?',
      description: 'Los gastos escolares incluyen: inscripción, colegiatura, materiales escolares, uniformes, libros y útiles necesarios para su educación.',
      component: (props: any) => (
        <GastosQuestion {...props} tipo="escolares" />
      ),
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // Pensión alimenticia
    {
      id: 'pension_alimenticia',
      title: 'Pensión alimenticia',
      description: 'Especifica el monto mensual y quién será responsable de proveerla',
      component: PensionQuestion,
      shouldShow: (data: any) => data.matrimonio_tieneHijos === true,
      rol: null,
    },

    // DOMICILIO (Para el convenio)
    {
      id: 'domicilio_calle',
      title: 'Calle del domicilio para notificaciones',
      description: 'Domicilio donde recibirán notificaciones del trámite',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={200} />
      ),
      rol: null,
    },
    {
      id: 'domicilio_numero',
      title: 'Número del domicilio',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={20} />
      ),
      rol: null,
    },
    {
      id: 'domicilio_colonia',
      title: 'Colonia',
      component: (props: any) => (
        <TextQuestion {...props} maxLength={100} />
      ),
      rol: null,
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
      rol: null,
    },

    // FIRMAS (Pasos 18-20)
    {
      id: 'firma_conyuge1',
      title: `Firma del primer cónyuge`,
      description: 'Se grabará tu imagen mientras firmas como evidencia legal',
      component: SignatureQuestion,
      rol: null,
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
      rol: null,
    },
    {
      id: 'firma_conyuge2',
      title: `Firma del segundo cónyuge`,
      description: 'Se grabará tu imagen mientras firmas como evidencia legal',
      component: SignatureQuestion,
      rol: null,
    },
  ]

  // Filtrar pasos según el estado del trámite y el rol del usuario
  let steps = allSteps

  const miRol = tramite.miRol
  const estado = tramite.estado

  if (estado === 'BORRADOR' || estado === 'ESPERANDO_CONYUGE_2') {
    // Mostrar solo los pasos del rol correspondiente
    steps = allSteps.filter((paso: any) => {
      // Pasos sin rol específico son visibles para todos
      if (!paso.rol) return true
      // Mostrar solo pasos que coincidan con mi rol
      return paso.rol === miRol
    })
  } else if (estado === 'EN_PROGRESO') {
    // Mostrar solo pasos compartidos (sin rol específico o pasos de matrimonio/firma)
    steps = allSteps.filter((paso: any) => {
      // Pasos sin rol específico son compartidos
      if (!paso.rol) return true
      // Filtrar pasos individuales de cónyuge1 y cónyuge2
      return false
    })
  }

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
