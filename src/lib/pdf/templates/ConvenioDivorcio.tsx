import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { cantidadALetras } from '@/lib/numeroALetras'

// Helper function to format convivencia_dias
const formatConvivenciaDias = (dias: string | string[] | undefined): string => {
  if (!dias) return 'A determinar'
  if (typeof dias === 'string') return dias

  const diasMap: { [key: string]: string } = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
    fines_semana: 'Fines de semana alternos',
    semanas_alternas: 'Semanas alternas',
  }

  return dias.map((d) => diasMap[d] || d).join(', ')
}

// Helper function to format gastos (medicos/escolares)
const formatGastos = (gastos: string | { tipo: string; porcentajePadre?: number; porcentajeMadre?: number } | undefined): string => {
  if (!gastos) return 'Se dividirán conforme a lo acordado por las partes.'
  if (typeof gastos === 'string') {
    if (gastos === 'Padre') return 'El padre en su 100%'
    if (gastos === 'Madre') return 'La madre en su 100%'
    return gastos
  }

  if (gastos.tipo === 'Compartida' && gastos.porcentajePadre && gastos.porcentajeMadre) {
    return `Compartida: ${gastos.porcentajePadre}% el padre, ${gastos.porcentajeMadre}% la madre`
  }

  if (gastos.tipo === 'Padre') return 'El padre en su 100%'
  if (gastos.tipo === 'Madre') return 'La madre en su 100%'

  return gastos.tipo
}

// Helper function to format pension
const formatPension = (
  pension?: { monto: number; responsable: string; porcentajePadre?: number; porcentajeMadre?: number },
  legacyMonto?: number,
  legacyResponsable?: string
): { monto: string; responsable: string } => {
  // Use new format if available
  if (pension) {
    const montoStr = `$${pension.monto.toFixed(2)} MXN`

    if (pension.responsable === 'Compartida' && pension.porcentajePadre && pension.porcentajeMadre) {
      const montoPadre = ((pension.monto * pension.porcentajePadre) / 100).toFixed(2)
      const montoMadre = ((pension.monto * pension.porcentajeMadre) / 100).toFixed(2)
      return {
        monto: montoStr,
        responsable: `Compartida: el padre aportará ${pension.porcentajePadre}% ($${montoPadre} MXN) y la madre aportará ${pension.porcentajeMadre}% ($${montoMadre} MXN)`,
      }
    }

    return {
      monto: montoStr,
      responsable: pension.responsable || 'A determinar',
    }
  }

  // Fallback to legacy format
  return {
    monto: legacyMonto ? `$${legacyMonto.toFixed(2)} MXN` : 'A determinar',
    responsable: legacyResponsable || 'A determinar',
  }
}

// Estilos para el documento
const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  indent: {
    marginLeft: 50,
    textAlign: 'justify',
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: '40%',
    textAlign: 'center',
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginBottom: 5,
    alignSelf: 'center',
  },
  signatureText: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 9,
  },
})

interface ConvenioDivorcioProps {
  datos: {
    // Cónyuges
    conyuge1_nombre: string
    conyuge1_apellido_paterno: string
    conyuge1_apellido_materno: string
    conyuge2_nombre: string
    conyuge2_apellido_paterno: string
    conyuge2_apellido_materno: string

    // Matrimonio
    matrimonio_fecha: string
    matrimonio_ciudad: string
    matrimonio_estado: string
    matrimonio_tieneHijos: boolean
    matrimonio_numeroHijos?: number

    // Datos de los hijos
    hijos_datos?: Array<{
      nombre: string
      fechaNacimiento: string
      edad: number
    }>

    // Convivencia y pensión (solo si tienen hijos)
    // guardia_custodia is always "Compartida" for voluntary divorce
    menor_vivira_con?: string
    convivencia_dias?: string | string[]
    convivencia_horarios?: string
    convivencia_vacaciones?: string
    gastos_medicos?: string | { tipo: string; porcentajePadre?: number; porcentajeMadre?: number }
    gastos_escolares?: string | { tipo: string; porcentajePadre?: number; porcentajeMadre?: number }
    pension_alimenticia?: {
      monto: number
      responsable: string
      porcentajePadre?: number
      porcentajeMadre?: number
      metodoActualizacion?: string
      cuentaBancaria?: string
    }
    // Legacy fields (old format)
    pension_monto?: number
    pension_responsable?: string

    // Domicilio (nuevo formato agrupado)
    domicilio?: {
      calle: string
      numero: string
      colonia: string
    }
    // Legacy formato separado
    domicilio_calle?: string
    domicilio_numero?: string
    domicilio_colonia?: string

    // Firmas
    firma_conyuge1?: string
    firma_conyuge2?: string

    // Fechas
    fecha_presentacion?: string
  }
}

export function ConvenioDivorcio({ datos }: ConvenioDivorcioProps) {
  const conyuge1 = `${datos.conyuge1_nombre || ''} ${datos.conyuge1_apellido_paterno || ''} ${datos.conyuge1_apellido_materno || ''}`.trim().toUpperCase() || 'CÓNYUGE 1'
  const conyuge2 = `${datos.conyuge2_nombre || ''} ${datos.conyuge2_apellido_paterno || ''} ${datos.conyuge2_apellido_materno || ''}`.trim().toUpperCase() || 'CÓNYUGE 2'

  const domicilio = datos.domicilio
    ? `${datos.domicilio.calle} número ${datos.domicilio.numero || 'S/N'} de la colonia ${datos.domicilio.colonia || ''}`.trim()
    : datos.domicilio_calle
    ? `${datos.domicilio_calle} número ${datos.domicilio_numero || 'S/N'} de la colonia ${datos.domicilio_colonia || ''}`.trim()
    : 'el que consta en autos'

  const fechaPresentacion = datos.fecha_presentacion || new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const fechaMatrimonio = datos.matrimonio_fecha
    ? new Date(datos.matrimonio_fecha).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '[FECHA MATRIMONIO]'

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.bold}>C. JUEZ DE LO FAMILIAR POR AUDIENCIAS EN TURNO</Text>
          <Text style={styles.bold}>DISTRITO MORELOS</Text>
          <Text style={styles.bold}>P R E S E N T E.–</Text>
        </View>

        {/* Promoventes */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>{conyuge1}</Text> y <Text style={styles.bold}>{conyuge2}</Text>, 
            mexicanos, mayores de edad, señalando como domicilio para oír y recibir toda clase de 
            notificaciones y documentos el ubicado en {domicilio} de esta ciudad, autorizando en 
            los términos más amplios del artículo 39 del Código de Procedimientos Familiares a los 
            LIC´S. FIDEL LEON PEREZ, LEÓN FELIPE LEÓN PALMA Y/O DAVID ALEJANDRO LEON PALMA Y/O 
            DAVID IVAN LEON MEDINA Y/O VIRIDIANA MENDOZA FLORES, con números de Cédulas Profesionales 
            722030, 5618264, 7376780, 10313259, 11996837, debidamente inscritas en el Registro 
            Digitalizado que se lleva en el Supremo Tribunal de Justicia, así como a la P.D. ANDREA 
            GRISEL QUEZADA MEJÍA, ante usted con el debido respeto comparecemos para exponer:
          </Text>
        </View>

        {/* Introducción */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            Que por medio del presente escrito, en la <Text style={styles.bold}>VÍA ESPECIAL DE 
            DIVORCIO Y POR MUTUO CONSENTIMIENTO</Text> venimos a disolver el vínculo matrimonial 
            que nos une, basándonos para ello en los siguientes hechos y consideraciones de derecho:
          </Text>
        </View>

        {/* HECHOS */}
        <View style={styles.section}>
          <Text style={styles.bold}>H E C H O S:</Text>
        </View>

        {/* Hecho I - Matrimonio */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>I.-</Text> Como lo acreditamos con la documental que agregamos
            al presente escrito, con fecha {fechaMatrimonio}, los suscritos contrajimos matrimonio en{' '}
            {datos.matrimonio_ciudad || '[CIUDAD]'}, {datos.matrimonio_estado || '[ESTADO]'}, bajo el régimen de Separación de Bienes.
          </Text>
        </View>

        {/* Hecho II - Hijos */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>II.-</Text> Bajo protesta de decir verdad, manifestamos a
            su señoría que durante nuestro matrimonio los suscritos {datos.matrimonio_tieneHijos
              ? `procreamos ${datos.matrimonio_numeroHijos} hijo(s)`
              : 'no procreamos hijos'}{datos.matrimonio_tieneHijos && datos.hijos_datos && datos.hijos_datos.length > 0
              ? ', cuyos nombres y edades son los siguientes:'
              : '.'}{'\n'}
            {datos.matrimonio_tieneHijos && datos.hijos_datos && datos.hijos_datos.map((hijo, index) => (
              `${index + 1}. ${hijo.nombre}, de ${hijo.edad} años de edad.\n`
            )).join('')}
          </Text>
        </View>

        {/* Hecho III - Convivencia y pensión (solo si tienen hijos) */}
        {datos.matrimonio_tieneHijos && (
          <View style={styles.section}>
            <Text style={styles.indent}>
              <Text style={styles.bold}>III.-</Text> Respecto de los menores de edad procreados,
              hemos convenido lo siguiente:{'\n\n'}

              <Text style={styles.bold}>a) GUARDIA Y CUSTODIA:</Text> La guardia y custodia de los menores será{' '}
              Compartida. El menor vivirá habitualmente con {datos.menor_vivira_con || 'el padre/la madre'}.{'\n\n'}

              <Text style={styles.bold}>b) RÉGIMEN DE CONVIVENCIA:{'\n'}</Text>
              <Text>• Días de convivencia: {formatConvivenciaDias(datos.convivencia_dias)}{'\n'}</Text>
              <Text>• Horarios de entrega y recogida: {datos.convivencia_horarios || 'A determinar'}{'\n'}</Text>
              <Text>• Vacaciones y días festivos: {datos.convivencia_vacaciones || 'A determinar'}{'\n\n'}</Text>

              <Text style={styles.bold}>c) GASTOS MÉDICOS:</Text> {formatGastos(datos.gastos_medicos)}{'\n\n'}

              <Text style={styles.bold}>d) GASTOS ESCOLARES:</Text> {formatGastos(datos.gastos_escolares)}{'\n\n'}

              {(() => {
                const pension = formatPension(datos.pension_alimenticia, datos.pension_monto, datos.pension_responsable)
                const cuentaBancaria = datos.pension_alimenticia?.cuentaBancaria || 'que se designe'
                const metodoActualizacion = datos.pension_alimenticia?.metodoActualizacion
                const metodoTexto = metodoActualizacion === 'indice_precios_consumidor'
                  ? 'conforme al Índice Nacional de Precios al Consumidor (INPC)'
                  : metodoActualizacion === 'salario_minimo'
                  ? 'conforme al incremento del salario mínimo general'
                  : metodoActualizacion === 'inflacion'
                  ? 'conforme a la tasa de inflación anual'
                  : 'conforme a lo que las partes acuerden'

                // Convertir cantidad a letras
                const montoNumerico = datos.pension_alimenticia?.monto || datos.pension_monto || 0
                const montoEnLetras = montoNumerico > 0 ? cantidadALetras(montoNumerico) : ''

                return (
                  <>
                    <Text style={styles.bold}>e) PENSIÓN ALIMENTICIA:</Text> {pension.responsable} se obliga a proporcionar
                    una pensión alimenticia mensual por la cantidad de {pension.monto}{montoEnLetras && ` (${montoEnLetras})`}, que será depositada
                    en la cuenta bancaria {cuentaBancaria !== 'que se designe' ? `CLABE ${cuentaBancaria}` : cuentaBancaria}, durante los primeros cinco días de cada mes.
                    {metodoActualizacion && ` La pensión se actualizará ${metodoTexto}.`}
                  </>
                )
              })()}
            </Text>
          </View>
        )}

        {/* Hecho III/IV - Voluntad de divorcio */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>{datos.matrimonio_tieneHijos ? 'IV' : 'III'}.-</Text> Es el caso que por así convenir a nuestros
            intereses, hemos decidido disolver nuestra unión matrimonial sin sujeción a causal
            alguna, toda vez que desde hace tiempo nos encontramos separados y no existe convivencia,
            ni relación matrimonial que justifique nuestro estado civil.
          </Text>
        </View>

        {/* Hecho IV/V - Bienes */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>{datos.matrimonio_tieneHijos ? 'V' : 'IV'}.-</Text> Además que nos casamos bajo el régimen de
            separación de bienes, los suscritos <Text style={styles.bold}>{conyuge1}</Text> y{' '}
            <Text style={styles.bold}>{conyuge2}</Text>, no adquirimos bienes muebles ni inmuebles
            en copropiedad.
          </Text>
        </View>

        {/* DERECHO */}
        <View style={styles.section}>
          <Text style={styles.bold}>D E R E C H O</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.indent}>
            Fundan nuestra demanda los artículos 254, 255, 266, 267 y demás relativos del Código
            Civil para nuestro Estado, así como los artículos 410, 411 y demás relativos del
            Código Procesal Civil, ambos del Estado de Chihuahua. Así como los artículos 569 a
            576 del Código de Procedimientos Familiares para el Estado de Chihuahua.
          </Text>
        </View>

        {/* Jurisprudencia (siempre) */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>JURISPRUDENCIA APLICABLE:{'\n\n'}</Text>
            Es aplicable la jurisprudencia de la Primera Sala de la Suprema Corte de Justicia
            de la Nación, con registro digital 2021695, Tesis 1a./J. 1/2020 (10a.), publicada en la
            Gaceta del Semanario Judicial de la Federación, Libro 75, Febrero de 2020, Tomo I,
            página 597, que establece:{'\n\n'}
            <Text style={styles.bold}>"DIVORCIO SIN EXPRESIÓN DE CAUSA. EN CONTRA DE LA RESOLUCIÓN QUE LO DECRETA,
            AUN SIN RESOLVER LA TOTALIDAD DE LAS CUESTIONES INHERENTES AL MATRIMONIO, PROCEDE EL JUICIO
            DE AMPARO DIRECTO (LEGISLACIONES DE LA CIUDAD DE MÉXICO, COAHUILA Y AGUASCALIENTES)."</Text>{'\n\n'}
            Lo anterior en virtud de que el divorcio sin expresión de causa es una institución que
            protege el derecho humano al libre desarrollo de la personalidad, permitiendo a las personas
            disolver el vínculo matrimonial sin necesidad de acreditar causal alguna.
          </Text>
        </View>

        {/* Petitorio */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            Por lo anteriormente expuesto:{'\n'}
            A USTED, C. JUEZ, ATENTAMENTE SOLICITAMOS:
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>PRIMERO.-</Text> Tenernos por presentados promoviendo JUICIO 
            ORDINARIO PARA DISOLVER POR MUTUO CONSENTIMIENTO EL VÍNCULO MATRIMONIAL que nos une en 
            los términos expuestos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>SEGUNDO.-</Text> Previa ratificación del presente escrito y 
            una vez pagados los derechos correspondientes se dicte Sentencia declarando la disolución 
            del Matrimonio solicitada.
          </Text>
        </View>

        {/* Protestas */}
        <View style={styles.section}>
          <Text style={styles.indent}>PROTESTAMOS LO NECESARIO</Text>
          <Text style={styles.indent}>Chihuahua, Chih., a {fechaPresentacion}</Text>
        </View>

        {/* Firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            {(datos.firma_manifestacion_conyuge1 || datos.firma_conyuge1) && (
              <Image src={datos.firma_manifestacion_conyuge1 || datos.firma_conyuge1} style={styles.signatureImage} />
            )}
            <Text style={[styles.bold, styles.signatureText]}>{conyuge1}</Text>
          </View>
          <View style={styles.signatureLine}>
            {(datos.firma_manifestacion_conyuge2 || datos.firma_conyuge2) && (
              <Image src={datos.firma_manifestacion_conyuge2 || datos.firma_conyuge2} style={styles.signatureImage} />
            )}
            <Text style={[styles.bold, styles.signatureText]}>{conyuge2}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado mediante el Portal Ciudadano</Text>
          <Text>Trámites Administrativos sin Litis - Estado de Chihuahua</Text>
        </View>
      </Page>
    </Document>
  )
}
