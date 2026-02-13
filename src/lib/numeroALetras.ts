/**
 * Convierte un número a su representación en letras (español de México)
 * @param num El número a convertir
 * @returns La representación en letras del número
 */
export function numeroALetras(num: number): string {
  const unidades = [
    '',
    'UNO',
    'DOS',
    'TRES',
    'CUATRO',
    'CINCO',
    'SEIS',
    'SIETE',
    'OCHO',
    'NUEVE',
  ]

  const decenas = [
    '',
    '',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ]

  const especiales = [
    'DIEZ',
    'ONCE',
    'DOCE',
    'TRECE',
    'CATORCE',
    'QUINCE',
    'DIECISÉIS',
    'DIECISIETE',
    'DIECIOCHO',
    'DIECINUEVE',
  ]

  const centenas = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ]

  if (num === 0) return 'CERO'
  if (num === 100) return 'CIEN'

  let letras = ''

  // Millones
  if (num >= 1000000) {
    const millones = Math.floor(num / 1000000)
    if (millones === 1) {
      letras += 'UN MILLÓN '
    } else {
      letras += numeroALetras(millones) + ' MILLONES '
    }
    num %= 1000000
  }

  // Miles
  if (num >= 1000) {
    const miles = Math.floor(num / 1000)
    if (miles === 1) {
      letras += 'MIL '
    } else {
      letras += numeroALetras(miles) + ' MIL '
    }
    num %= 1000
  }

  // Centenas
  if (num >= 100) {
    const cent = Math.floor(num / 100)
    letras += centenas[cent] + ' '
    num %= 100
  }

  // Decenas y unidades
  if (num >= 20) {
    const dec = Math.floor(num / 10)
    letras += decenas[dec]
    num %= 10
    if (num > 0) {
      letras += ' Y ' + unidades[num]
    }
  } else if (num >= 10) {
    letras += especiales[num - 10]
  } else if (num > 0) {
    letras += unidades[num]
  }

  return letras.trim()
}

/**
 * Convierte una cantidad monetaria a su representación en letras
 * @param cantidad La cantidad en pesos (puede incluir centavos)
 * @returns La representación en letras de la cantidad (ej: "VEINTE MIL PESOS MEXICANOS 00/100 M.N.")
 */
export function cantidadALetras(cantidad: number): string {
  const enteros = Math.floor(cantidad)
  const centavos = Math.round((cantidad - enteros) * 100)

  let letras = numeroALetras(enteros)

  // Pluralizar "peso" o "pesos"
  if (enteros === 1) {
    letras += ' PESO MEXICANO'
  } else {
    letras += ' PESOS MEXICANOS'
  }

  // Agregar centavos
  const centavosStr = centavos.toString().padStart(2, '0')
  letras += ` ${centavosStr}/100 M.N.`

  return letras
}
