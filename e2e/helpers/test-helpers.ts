import { Page } from '@playwright/test'

export async function registrarUsuario(
  page: Page,
  datos: { nombre: string; email: string; password: string }
) {
  await page.goto('/registro')
  await page.fill('input[name="nombre"]', datos.nombre)
  await page.fill('input[name="email"]', datos.email)
  await page.fill('input[name="password"]', datos.password)
  await page.fill('input[name="confirmPassword"]', datos.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

export async function loginUsuario(
  page: Page,
  datos: { email: string; password: string }
) {
  await page.goto('/login')
  await page.fill('input[type="email"]', datos.email)
  await page.fill('input[type="password"]', datos.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

export async function iniciarTramite(page: Page): Promise<string> {
  await page.goto('/dashboard')
  await page.click('text=Iniciar Trámite')
  await page.waitForURL(/\/tramites\/divorcio\//, { timeout: 10000 })

  const url = page.url()
  const tramiteId = url.split('/').filter(Boolean).pop() || ''
  return tramiteId
}

export async function llenarPasoTexto(page: Page, texto: string) {
  await page.fill('input[type="text"]', texto)
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(500)
}

export async function llenarPasoFecha(page: Page, fecha: string) {
  await page.fill('input[type="date"]', fecha)
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(500)
}

export async function llenarPasoEmail(page: Page, email: string) {
  await page.fill('input[type="email"]', email)
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(500)
}

export async function subirArchivo(page: Page, nombre: string) {
  const buffer = Buffer.from(`fake-file-${nombre}`)
  await page.setInputFiles('input[type="file"]', {
    name: `${nombre}.jpg`,
    mimeType: 'image/jpeg',
    buffer: buffer,
  })
  await page.waitForTimeout(2000) // Esperar upload
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(500)
}

export async function seleccionarOpcion(page: Page, valor: string) {
  await page.click('select')
  await page.selectOption('select', valor)
  await page.click('button:has-text("Siguiente")')
  await page.waitForTimeout(500)
}

export function generarDatosPrueba() {
  const timestamp = Date.now()

  return {
    conyuge1: {
      email: `test-c1-${timestamp}@ejemplo.com`,
      password: 'Password123!',
      nombre: 'Juan',
      apellidos: 'Pérez García',
      curp: 'PEGJ900101HCHRRN09',
      fechaNacimiento: '1990-01-01',
    },
    conyuge2: {
      email: `test-c2-${timestamp}@ejemplo.com`,
      nombre: 'María',
      apellidos: 'López Hernández',
      curp: 'LOHM920202MCHPRS08',
      fechaNacimiento: '1992-02-02',
    },
    matrimonio: {
      fecha: '2015-06-15',
      estado: 'Chihuahua',
      ciudad: 'Chihuahua',
    },
    direccion: {
      calle: 'Av. Universidad',
      numero: '123',
      colonia: 'Centro',
    },
  }
}
