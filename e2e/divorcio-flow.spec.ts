import { test, expect } from '@playwright/test'

// Datos de prueba
const datosConyugue1 = {
  email: `test-conyuge1-${Date.now()}@ejemplo.com`,
  password: 'Password123!',
  nombre: 'Juan',
  apellidos: 'Pérez García',
  curp: 'PEGJ900101HCHRRN09',
  fechaNacimiento: '1990-01-01',
  correo: `test-conyuge1-${Date.now()}@ejemplo.com`,
}

const datosConyugue2 = {
  nombre: 'María',
  apellidos: 'López Hernández',
  curp: 'LOHM920202MCHPRS08',
  fechaNacimiento: '1992-02-02',
  correo: `test-conyuge2-${Date.now()}@ejemplo.com`,
}

const datosMatrimonio = {
  fecha: '2015-06-15',
  estado: 'Chihuahua',
  ciudad: 'Chihuahua',
}

const datosDireccion = {
  calle: 'Av. Universidad',
  numero: '123',
  colonia: 'Centro',
}

let tramiteId: string
let invitacionToken: string

test.describe('Flujo completo de divorcio voluntario', () => {
  test('1. Registro del cónyuge 1', async ({ page }) => {
    await page.goto('/registro')

    await page.fill('input[name="nombre"]', datosConyugue1.nombre)
    await page.fill('input[name="email"]', datosConyugue1.email)
    await page.fill('input[name="password"]', datosConyugue1.password)
    await page.fill('input[name="confirmPassword"]', datosConyugue1.password)

    await page.click('button[type="submit"]')

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('2. Iniciar trámite de divorcio', async ({ page }) => {
    // Login si es necesario
    await page.goto('/login')
    await page.fill('input[type="email"]', datosConyugue1.email)
    await page.fill('input[type="password"]', datosConyugue1.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)

    // Iniciar trámite
    await page.click('text=Iniciar Trámite')
    await page.waitForURL(/\/tramites\/divorcio\//, { timeout: 10000 })

    // Guardar el ID del trámite
    const url = page.url()
    tramiteId = url.split('/').filter(Boolean).pop() || ''
    console.log('Trámite ID:', tramiteId)
  })

  test('3. Llenar datos del cónyuge 1', async ({ page }) => {
    await page.goto(`/tramites/divorcio/${tramiteId}`)

    // Paso 1: Bienvenida
    await page.click('button:has-text("Siguiente")')

    // Paso 2: Nombre
    await page.fill('input[type="text"]', datosConyugue1.nombre)
    await page.click('button:has-text("Siguiente")')

    // Paso 3: Apellidos
    await page.fill('input[type="text"]', datosConyugue1.apellidos)
    await page.click('button:has-text("Siguiente")')

    // Paso 4: CURP
    await page.fill('input[type="text"]', datosConyugue1.curp)
    await page.click('button:has-text("Siguiente")')

    // Paso 5: Fecha de nacimiento
    await page.fill('input[type="date"]', datosConyugue1.fechaNacimiento)
    await page.click('button:has-text("Siguiente")')

    // Paso 6: INE frontal (skip por ahora - requiere archivo)
    // Crear un archivo de prueba temporal
    const buffer = Buffer.from('fake-ine-frontal-image')
    await page.setInputFiles('input[type="file"]', {
      name: 'ine-frontal.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    })
    await page.waitForTimeout(2000) // Esperar upload
    await page.click('button:has-text("Siguiente")')

    // Paso 7: INE trasera (skip por ahora - requiere archivo)
    await page.setInputFiles('input[type="file"]', {
      name: 'ine-trasera.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    })
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Siguiente")')

    // Paso 8: Correo
    await page.fill('input[type="email"]', datosConyugue1.correo)
    await page.click('button:has-text("Siguiente")')

    // Debería redirigir a página de invitación
    await expect(page).toHaveURL(/\/invitar/, { timeout: 10000 })
  })

  test('4. Enviar invitación al cónyuge 2', async ({ page }) => {
    await page.goto(`/tramites/divorcio/${tramiteId}/invitar`)

    // Llenar email del cónyuge 2
    await page.fill('input[type="email"]', datosConyugue2.correo)
    await page.click('button:has-text("Enviar Invitación")')

    // Esperar a que aparezca el link
    await page.waitForSelector('input[readonly]', { timeout: 10000 })

    // Extraer el token del link
    const link = await page.inputValue('input[readonly]')
    invitacionToken = link.split('/').pop() || ''
    console.log('Token de invitación:', invitacionToken)

    expect(invitacionToken).toBeTruthy()
  })

  test('5. Cónyuge 2 completa sus datos (SIN LOGIN)', async ({ page }) => {
    // Abrir el link de invitación (sin estar logueado)
    await page.goto(`/conyuge2/${invitacionToken}`)

    // Paso 1: Bienvenida
    await page.click('button:has-text("Siguiente")')

    // Paso 2: Nombre
    await page.fill('input[type="text"]', datosConyugue2.nombre)
    await page.click('button:has-text("Siguiente")')

    // Paso 3: Apellidos
    await page.fill('input[type="text"]', datosConyugue2.apellidos)
    await page.click('button:has-text("Siguiente")')

    // Paso 4: CURP
    await page.fill('input[type="text"]', datosConyugue2.curp)
    await page.click('button:has-text("Siguiente")')

    // Paso 5: Fecha de nacimiento
    await page.fill('input[type="date"]', datosConyugue2.fechaNacimiento)
    await page.click('button:has-text("Siguiente")')

    // Paso 6: INE frontal
    const buffer = Buffer.from('fake-ine-frontal-image-2')
    await page.setInputFiles('input[type="file"]', {
      name: 'ine-frontal-2.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    })
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Siguiente")')

    // Paso 7: INE trasera
    await page.setInputFiles('input[type="file"]', {
      name: 'ine-trasera-2.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    })
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Siguiente")')

    // Paso 8: Correo
    await page.fill('input[type="email"]', datosConyugue2.correo)
    await page.click('button:has-text("Finalizar")')

    // Debería redirigir a confirmación
    await expect(page).toHaveURL(/\/confirmacion/, { timeout: 10000 })
  })

  test('6. Cónyuge 1 completa datos del matrimonio e hijos', async ({ page }) => {
    // Login como cónyuge 1
    await page.goto('/login')
    await page.fill('input[type="email"]', datosConyugue1.email)
    await page.fill('input[type="password"]', datosConyugue1.password)
    await page.click('button[type="submit"]')

    await page.goto(`/tramites/divorcio/${tramiteId}`)

    // Fecha de matrimonio
    await page.fill('input[type="date"]', datosMatrimonio.fecha)
    await page.click('button:has-text("Siguiente")')

    // Estado
    await page.click('select')
    await page.selectOption('select', datosMatrimonio.estado)
    await page.click('button:has-text("Siguiente")')

    // Ciudad
    await page.click('select')
    await page.selectOption('select', datosMatrimonio.ciudad)
    await page.click('button:has-text("Siguiente")')

    // Firma de manifestación de voluntad
    // (necesitaría implementar canvas drawing - skip por ahora)
    await page.click('button:has-text("Siguiente")')

    // ¿Tienen hijos? - NO
    await page.click('button:has-text("No")')

    // Dirección
    await page.fill('input[placeholder*="calle" i]', datosDireccion.calle)
    await page.fill('input[placeholder*="número" i]', datosDireccion.numero)
    await page.fill('input[placeholder*="colonia" i]', datosDireccion.colonia)
    await page.click('button:has-text("Siguiente")')

    // Acta de matrimonio (upload)
    const buffer = Buffer.from('fake-acta-matrimonio')
    await page.setInputFiles('input[type="file"]', {
      name: 'acta.pdf',
      mimeType: 'application/pdf',
      buffer: buffer,
    })
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Siguiente")')

    // Firmas finales - skip canvas drawing
    // ...

    // Al finalizar debería redirigir a convenio
    await expect(page).toHaveURL(/\/convenio/, { timeout: 15000 })
  })

  test('7. Descargar convenio PDF', async ({ page }) => {
    await page.goto(`/tramites/divorcio/${tramiteId}/convenio`)

    // Click en descargar convenio
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Descargar Convenio")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')

    console.log('✓ Convenio descargado:', download.suggestedFilename())
  })
})
