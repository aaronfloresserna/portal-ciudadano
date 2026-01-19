// Tipos para el trámite de Divorcio Voluntario

export type TramiteTipo = 'DIVORCIO_VOLUNTARIO'
export type TramiteEstado = 'BORRADOR' | 'COMPLETADO'

export type RegimenPatrimonial = 'SEPARACION_BIENES' | 'SOCIEDAD_CONYUGAL'

export type TipoDocumento =
  | 'INE_CONYUGE_1'
  | 'INE_CONYUGE_2'
  | 'ACTA_MATRIMONIO'
  | 'CONVENIO'

export interface Conyuge {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp: string
  fechaNacimiento: string
  lugarNacimiento: string
}

export interface Matrimonio {
  fechaCelebracion: string
  lugarCelebracion: string
  regimenPatrimonial: RegimenPatrimonial
  tieneHijos: boolean
  numeroHijos?: number
}

export interface DivorcioData {
  conyuge1?: Conyuge
  conyuge2?: Conyuge
  matrimonio?: Matrimonio
  firma?: string // base64
}

export interface Tramite {
  id: string
  usuarioId: string
  tipo: TramiteTipo
  estado: TramiteEstado
  pasoActual: number
  datos: DivorcioData
  createdAt: Date
  updatedAt: Date
}

export interface Documento {
  id: string
  tramiteId: string
  tipo: TipoDocumento
  nombreArchivo: string
  path: string
  mimeType: string
  size: number
  createdAt: Date
}

export interface Expediente {
  id: string
  tramiteId: string
  pdfPath: string
  hashSha256: string
  generatedAt: Date
}

// Mapeo de tipos de documento a nombres amigables
export const DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  INE_CONYUGE_1: 'INE Cónyuge 1',
  INE_CONYUGE_2: 'INE Cónyuge 2',
  ACTA_MATRIMONIO: 'Acta de Matrimonio',
  CONVENIO: 'Convenio de Divorcio',
}

// Mapeo de regimen patrimonial a nombres amigables
export const REGIMEN_LABELS: Record<RegimenPatrimonial, string> = {
  SEPARACION_BIENES: 'Separación de Bienes',
  SOCIEDAD_CONYUGAL: 'Sociedad Conyugal',
}
