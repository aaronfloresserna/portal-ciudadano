import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  const userEmail = `test-${Date.now()}@ejemplo.com`
  const userPassword = 'Password123!'
  const userName = 'Test User'

  test('Puede registrar un nuevo usuario', async ({ page }) => {
    await page.goto('/registro')

    // Llenar formulario de registro
    await page.fill('input[name="nombre"]', userName)
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.fill('input[name="confirmPassword"]', userPassword)

    // Submit
    await page.click('button[type="submit"]')

    // Debería redirigir al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Verificar que aparezca el nombre del usuario
    await expect(page.locator('body')).toContainText(userName)
  })

  test('Puede iniciar sesión con usuario existente', async ({ page }) => {
    // Primero registrar
    await page.goto('/registro')
    await page.fill('input[name="nombre"]', userName)
    await page.fill('input[name="email"]', userEmail)
    await page.fill('input[name="password"]', userPassword)
    await page.fill('input[name="confirmPassword"]', userPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)

    // Cerrar sesión (si hay botón)
    // await page.click('text=Cerrar sesión')

    // Ir a login
    await page.goto('/login')
    await page.fill('input[type="email"]', userEmail)
    await page.fill('input[type="password"]', userPassword)
    await page.click('button[type="submit"]')

    // Verificar que redirige al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('Muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'wrong@ejemplo.com')
    await page.fill('input[type="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')

    // Debería mostrar un error
    await expect(page.locator('text=/error|incorrecto|inválido/i')).toBeVisible({
      timeout: 5000,
    })
  })
})
