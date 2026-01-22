import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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
    conyuge1_apellidos: string
    conyuge2_nombre: string
    conyuge2_apellidos: string

    // Matrimonio
    matrimonio_fecha: string
    matrimonio_lugar: string
    matrimonio_tieneHijos: boolean
    matrimonio_numeroHijos?: number

    // Convivencia y pensión (solo si tienen hijos)
    convivencia_tipo?: string
    pension_monto?: number
    pension_responsable?: string

    // Domicilio
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
  const conyuge1 = `${datos.conyuge1_nombre || ''} ${datos.conyuge1_apellidos || ''}`.trim().toUpperCase() || 'CÓNYUGE 1'
  const conyuge2 = `${datos.conyuge2_nombre || ''} ${datos.conyuge2_apellidos || ''}`.trim().toUpperCase() || 'CÓNYUGE 2'

  const domicilio = datos.domicilio_calle
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
            {datos.matrimonio_lugar || '[LUGAR MATRIMONIO]'}, bajo el régimen de Separación de Bienes.
          </Text>
        </View>

        {/* Hecho II - Hijos */}
        <View style={styles.section}>
          <Text style={styles.indent}>
            <Text style={styles.bold}>II.-</Text> Bajo protesta de decir verdad, manifestamos a
            su señoría que durante nuestro matrimonio los suscritos {datos.matrimonio_tieneHijos
              ? `procreamos ${datos.matrimonio_numeroHijos} hijo(s)`
              : 'no procreamos hijos'}.
          </Text>
        </View>

        {/* Hecho III - Convivencia y pensión (solo si tienen hijos) */}
        {datos.matrimonio_tieneHijos && (
          <View style={styles.section}>
            <Text style={styles.indent}>
              <Text style={styles.bold}>III.-</Text> Respecto de los menores de edad procreados,
              hemos convenido lo siguiente:{'\n\n'}
              <Text style={styles.bold}>a) CONVIVENCIA:</Text> {datos.convivencia_tipo || 'Se establecerá conforme a lo que determine la autoridad competente.'}{'\n\n'}
              <Text style={styles.bold}>b) PENSIÓN ALIMENTICIA:</Text> La parte responsable{' '}
              {datos.pension_responsable ? `(${datos.pension_responsable})` : ''} se obliga a proporcionar
              una pensión alimenticia mensual por la cantidad de ${datos.pension_monto ? datos.pension_monto.toLocaleString('es-MX') : '_______'} MXN
              ({datos.pension_monto ? 'pesos mexicanos' : 'a determinar'}), que será depositada
              en la cuenta bancaria que se designe, durante los primeros cinco días de cada mes.
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
            {datos.firma_conyuge1 && (
              <Image src={datos.firma_conyuge1} style={styles.signatureImage} />
            )}
            <Text style={[styles.bold, styles.signatureText]}>{conyuge1}</Text>
          </View>
          <View style={styles.signatureLine}>
            {datos.firma_conyuge2 && (
              <Image src={datos.firma_conyuge2} style={styles.signatureImage} />
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
