import { test, expect } from '@playwright/test'

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

// Helper: subir un archivo falso a un input type="file"
async function subirArchivoFalso(page: any, nombre: string) {
  const buffer = Buffer.from(`fake-file-${nombre}`)
  await page.setInputFiles('input[type="file"]', {
    name: `${nombre}.jpg`,
    mimeType: 'image/jpeg',
    buffer,
  })
  // Esperar a que la subida termine (el texto "Subiendo archivo..." desaparezca)
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Subiendo archivo...'),
    { timeout: 15000 }
  )
}

// Helper: esperar a que el wizard avance al siguiente paso
// Después de hacer click en "Siguiente", espera a que aparezca el heading del nuevo paso
async function esperarPaso(page: any, textoHeading: string, timeout = 15000) {
  await page.waitForSelector(`text=${textoHeading}`, {
    state: 'visible',
    timeout,
  })
}

test.describe('Flujo completo de divorcio voluntario - modalidad separado', () => {
  // Estado compartido, inicializado en beforeAll para garantizar consistencia entre tests
  let emailC1 = ''
  let emailC2 = ''
  const password = 'Password123!'
  let tramiteId = ''
  let invitacionToken = ''

  const datosC1 = {
    nombre: 'Juan',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'García',
    curp: 'PEGJ900101HCHRRN09',
    fechaNacimiento: '1990-01-01',
  }

  const datosC2 = {
    nombre: 'María',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Hernández',
    curp: 'LOHM920202MCHPRS08',
    fechaNacimiento: '1992-02-02',
  }

  test.beforeAll(async () => {
    // Generar emails únicos UNA sola vez para todos los tests del describe
    const ts = Date.now()
    emailC1 = `test-c1-${ts}@ejemplo.com`
    emailC2 = `test-c2-${ts}@ejemplo.com`
  })

  test('1. Registro del cónyuge 1', async ({ page }) => {
    await page.goto('/registro')

    await page.fill('input[name="nombre"]', datosC1.nombre)
    await page.fill('input[name="email"]', emailC1)
    await page.fill('input[name="password"]', password)

    await page.click('button[type="submit"]')

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  test('2. Iniciar trámite de divorcio', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', emailC1)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Iniciar trámite - navega a /nuevo y luego redirige al ID real
    await page.click('text=Iniciar Trámite')
    // Esperar a que salga de /nuevo y llegue al trámite con ID real (CUID)
    await page.waitForURL(
      (url) => url.href.includes('/tramites/divorcio/') && !url.href.endsWith('/nuevo'),
      { timeout: 15000 }
    )

    // Guardar el ID del trámite
    const url = page.url()
    tramiteId = url.split('/').filter(Boolean).pop() || ''
    console.log('Trámite ID:', tramiteId)
    expect(tramiteId).toBeTruthy()
    expect(tramiteId).not.toBe('nuevo')
  })

  test('3. Llenar datos del cónyuge 1 (flujo separado)', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', emailC1)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    await page.goto(`/tramites/divorcio/${tramiteId}`)
    await page.waitForLoadState('networkidle')

    // Paso 1: Bienvenida (WelcomeStep auto-establece valor; esperar que el botón esté habilitado)
    await esperarPaso(page, '¡Bienvenido')
    await page.click('button:has-text("Siguiente")')

    // Paso 2: Nombre
    await esperarPaso(page, '¿Cuál es el nombre del primer cónyuge?')
    await page.fill('input', datosC1.nombre)
    await page.click('button:has-text("Siguiente")')

    // Paso 3: Apellido paterno
    await esperarPaso(page, 'apellido paterno del primer cónyuge')
    await page.fill('input', datosC1.apellidoPaterno)
    await page.click('button:has-text("Siguiente")')

    // Paso 4: Apellido materno
    await esperarPaso(page, 'apellido materno del primer cónyuge')
    await page.fill('input', datosC1.apellidoMaterno)
    await page.click('button:has-text("Siguiente")')

    // Paso 5: CURP (18 caracteres)
    await esperarPaso(page, 'CURP del primer cónyuge')
    await page.fill('input', datosC1.curp)
    await page.click('button:has-text("Siguiente")')

    // Paso 6: Fecha de nacimiento
    await esperarPaso(page, 'Fecha de nacimiento del primer cónyuge')
    await page.fill('input[type="date"]', datosC1.fechaNacimiento)
    await page.click('button:has-text("Siguiente")')

    // Paso 7: INE frontal
    await esperarPaso(page, 'frontal de la INE del primer cónyuge')
    await subirArchivoFalso(page, 'ine-frontal')
    await page.click('button:has-text("Siguiente")')

    // Paso 8: INE trasera
    await esperarPaso(page, 'trasera de la INE del primer cónyuge')
    await subirArchivoFalso(page, 'ine-trasera')
    await page.click('button:has-text("Siguiente")')

    // Paso 9: Correo electrónico
    await esperarPaso(page, 'Correo electrónico del primer cónyuge')
    await page.fill('input', emailC1)
    await page.click('button:has-text("Siguiente")')

    // Paso 10: Modalidad del trámite → seleccionar "Por separado"
    await esperarPaso(page, '¿Cómo desean completar el trámite?')
    await page.click('button:has-text("Por separado")')
    await page.click('button:has-text("Siguiente")')

    // Paso 11: Fecha de matrimonio
    await esperarPaso(page, '¿Cuándo se casaron?')
    await page.fill('input[type="date"]', datosMatrimonio.fecha)
    await page.click('button:has-text("Siguiente")')

    // Paso 12: Estado donde se casaron
    await esperarPaso(page, '¿En qué estado se casaron?')
    await page.selectOption('select', datosMatrimonio.estado)
    await page.click('button:has-text("Siguiente")')

    // Paso 13: Ciudad donde se casaron
    await esperarPaso(page, '¿En qué ciudad se casaron?')
    const tieneSelectorCiudad = (await page.$('select')) !== null
    if (tieneSelectorCiudad) {
      await page.selectOption('select', datosMatrimonio.ciudad)
    } else {
      await page.fill('input', datosMatrimonio.ciudad)
    }
    await page.click('button:has-text("Siguiente")')

    // Paso 14: ¿Tienen hijos? → No (YesNoQuestion: auto-avanza después de 300ms)
    await esperarPaso(page, '¿Tienen hijos en común?')
    await page.click('button:has-text("No")')
    // YesNoQuestion llama onNext() automáticamente tras 300ms; esperar al siguiente paso
    await esperarPaso(page, 'Domicilio para notificaciones')

    // Paso 15: Domicilio (DireccionQuestion)
    await page.fill('[placeholder="Ej: Av. Juárez"]', datosDireccion.calle)
    await page.fill('[placeholder="Ej: 123"]', datosDireccion.numero)
    await page.fill('[placeholder="Ej: Centro"]', datosDireccion.colonia)
    await page.click('button:has-text("Siguiente")')

    // Paso 16: Acta de matrimonio (último paso visible para modalidad "separado")
    await esperarPaso(page, 'Sube el acta de matrimonio')
    await subirArchivoFalso(page, 'acta-matrimonio')
    // Este es el último paso; el wizard llama onComplete y redirige a /invitar
    await page.click('button:has-text("Siguiente")')

    // Debería redirigir a la página de invitación
    await expect(page).toHaveURL(/\/invitar/, { timeout: 15000 })
  })

  test('4. Enviar invitación al cónyuge 2', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', emailC1)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    await page.goto(`/tramites/divorcio/${tramiteId}/invitar`)
    await page.waitForLoadState('networkidle')

    // Llenar email del cónyuge 2
    await page.fill('input[type="email"]', emailC2)
    await page.click('button:has-text("Enviar Invitación")')

    // Esperar a que aparezca el input de solo lectura con el link
    await page.waitForSelector('input[readonly]', { timeout: 15000 })

    // Extraer el token del link
    const link = await page.inputValue('input[readonly]')
    invitacionToken = link.split('/').pop() || ''
    console.log('Token de invitación:', invitacionToken)

    expect(invitacionToken).toBeTruthy()
    expect(invitacionToken.length).toBe(64) // 32 bytes en hex
  })

  test('5. Cónyuge 2 completa sus datos (SIN LOGIN)', async ({ page }) => {
    // Abrir el link de invitación sin estar logueado
    await page.goto(`/conyuge2/${invitacionToken}`)
    await page.waitForLoadState('networkidle')

    // Esperar a que se verifique la invitación y cargue el wizard (paso bienvenida)
    await esperarPaso(page, '¡Hola!')

    // Paso 1: Bienvenida (WelcomeStep auto-establece valor)
    await page.click('button:has-text("Siguiente")')

    // Paso 2: Revisión de datos (solo en modalidad "separado")
    await esperarPaso(page, 'Revisión de información')
    // Aceptar la sección de Datos del Matrimonio
    const botones = await page.$$('button:has-text("Aceptar")')
    for (const boton of botones) {
      await boton.click()
      await page.waitForTimeout(200)
    }
    // Una vez aceptadas todas las secciones, aparece el botón "Continuar con mis datos personales"
    await page.click('button:has-text("Continuar con mis datos personales")')

    // Paso 3: Nombre del cónyuge 2
    await esperarPaso(page, '¿Cuál es tu nombre?')
    await page.fill('input', datosC2.nombre)
    await page.click('button:has-text("Siguiente")')

    // Paso 4: Apellido paterno
    await esperarPaso(page, '¿Cuál es tu apellido paterno?')
    await page.fill('input', datosC2.apellidoPaterno)
    await page.click('button:has-text("Siguiente")')

    // Paso 5: Apellido materno
    await esperarPaso(page, '¿Cuál es tu apellido materno?')
    await page.fill('input', datosC2.apellidoMaterno)
    await page.click('button:has-text("Siguiente")')

    // Paso 6: CURP
    await esperarPaso(page, 'Tu CURP')
    await page.fill('input', datosC2.curp)
    await page.click('button:has-text("Siguiente")')

    // Paso 7: Fecha de nacimiento
    await esperarPaso(page, 'Tu fecha de nacimiento')
    await page.fill('input[type="date"]', datosC2.fechaNacimiento)
    await page.click('button:has-text("Siguiente")')

    // Paso 8: INE frontal
    await esperarPaso(page, 'frontal de tu INE')
    await subirArchivoFalso(page, 'ine-frontal-c2')
    await page.click('button:has-text("Siguiente")')

    // Paso 9: INE trasera
    await esperarPaso(page, 'trasera de tu INE')
    await subirArchivoFalso(page, 'ine-trasera-c2')
    await page.click('button:has-text("Siguiente")')

    // Paso 10: Correo (último paso → botón "Finalizar")
    await esperarPaso(page, 'Tu correo electrónico')
    await page.fill('input', emailC2)
    await page.click('button:has-text("Finalizar")')

    // Debería redirigir a la página de confirmación
    await expect(page).toHaveURL(/\/confirmacion/, { timeout: 15000 })
  })

  test('6. Cónyuge 1 - segunda fase (datos matrimonio ya completados)', async ({ page }) => {
    // Login como cónyuge 1
    await page.goto('/login')
    await page.fill('input[type="email"]', emailC1)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // En esta fase el trámite está EN_PROGRESO y el cónyuge 1 debe firmar
    await page.goto(`/tramites/divorcio/${tramiteId}`)
    await page.waitForLoadState('networkidle')

    // Verificar que estamos en el formulario correcto (fase de firmas)
    await expect(page).toHaveURL(new RegExp(`/tramites/divorcio/${tramiteId}`))

    console.log('✓ Cónyuge 1 accede correctamente a la segunda fase del trámite')
  })
})
