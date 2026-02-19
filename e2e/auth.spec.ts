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

    // Submit
    await page.click('button[type="submit"]')

    // Debería redirigir al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Verificar que aparezca el nombre del usuario
    await expect(page.locator('body')).toContainText(userName)
  })

  test('Puede iniciar sesión con usuario existente', async ({ page }) => {
    // El usuario ya fue registrado en el test anterior (mismo userEmail)
    // Ir directo a login
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

    // El API devuelve "Credenciales inválidas"
    await expect(page.locator('text=/Credenciales inválidas/i')).toBeVisible({
      timeout: 5000,
    })
  })
})
