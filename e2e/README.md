# Tests E2E con Playwright

Tests automatizados end-to-end para el Portal Ciudadano.

## 🚀 Instalación

Los navegadores ya deberían estar instalados. Si no:

```bash
npx playwright install chromium
```

## 📝 Ejecutar Tests

### Modo headless (sin interfaz)
```bash
npm run test:e2e
```

### Modo UI (interfaz visual de Playwright)
```bash
npm run test:e2e:ui
```

### Modo headed (ver el navegador)
```bash
npm run test:e2e:headed
```

### Modo debug (paso a paso)
```bash
npm run test:e2e:debug
```

### Ejecutar un solo test
```bash
npx playwright test auth.spec.ts
```

### Ver reporte HTML
```bash
npx playwright show-report
```

## 📁 Estructura de Tests

```
e2e/
├── auth.spec.ts              # Tests de autenticación (registro, login)
├── divorcio-flow.spec.ts     # Test completo del flujo de divorcio
├── helpers/
│   └── test-helpers.ts       # Funciones auxiliares para tests
└── README.md                 # Esta documentación
```

## 🧪 Tests Disponibles

### `auth.spec.ts`
- ✅ Registro de nuevo usuario
- ✅ Login con usuario existente
- ✅ Error con credenciales incorrectas

### `divorcio-flow.spec.ts`
- ✅ Registro del cónyuge 1
- ✅ Iniciar trámite de divorcio
- ✅ Llenar datos del cónyuge 1
- ✅ Enviar invitación al cónyuge 2
- ✅ Cónyuge 2 completa sus datos (sin login)
- ✅ Completar datos del matrimonio
- ✅ Descargar convenio PDF

## 🎯 Datos de Prueba

Los tests generan datos únicos automáticamente usando timestamps:

```typescript
{
  conyuge1: {
    email: 'test-c1-1234567890@ejemplo.com',
    password: 'Password123!',
    nombre: 'Juan',
    apellidos: 'Pérez García',
    curp: 'PEGJ900101HCHRRN09',
  },
  conyuge2: {
    nombre: 'María',
    apellidos: 'López Hernández',
    curp: 'LOHM920202MCHPRS08',
  }
}
```

## ⚙️ Configuración

La configuración está en `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Workers**: 1 (tests secuenciales)
- **Retries**: 2 en CI, 0 en local
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Trace**: En primer retry

## 📊 Ver Resultados

Después de ejecutar tests:

```bash
npx playwright show-report
```

Esto abre un reporte HTML con:
- ✅ Tests pasados
- ❌ Tests fallidos
- 📸 Screenshots de fallos
- 🎥 Videos de fallos
- 📝 Traces interactivos

## 🔧 Escribir Nuevos Tests

Usar las funciones helper de `helpers/test-helpers.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { registrarUsuario, iniciarTramite } from './helpers/test-helpers'

test('Mi nuevo test', async ({ page }) => {
  await registrarUsuario(page, {
    nombre: 'Test',
    email: 'test@ejemplo.com',
    password: 'Password123!'
  })

  const tramiteId = await iniciarTramite(page)

  // ... resto del test
})
```

## 🐛 Debug

Para debuggear un test específico:

```bash
npx playwright test auth.spec.ts --debug
```

Esto abre:
- El navegador en modo interactivo
- Inspector de Playwright con controles paso a paso
- Console logs de la aplicación

## 📝 Notas

- Los tests requieren que el servidor de desarrollo esté corriendo
- Playwright inicia automáticamente `npm run dev` antes de los tests
- Los tests usan una base de datos local (configurar DATABASE_URL)
- Los archivos subidos son fake (buffers en memoria)
- Las firmas de canvas aún no están implementadas en los tests

## 🚨 Troubleshooting

### Error: "Timeout waiting for page"
- Asegúrate de que el servidor está corriendo en puerto 3000
- Aumenta el timeout en playwright.config.ts

### Error: "Element not found"
- Verifica que los selectores coincidan con el HTML real
- Usa `--headed` para ver qué está pasando en el navegador

### Error: "Database connection"
- Configura DATABASE_URL correctamente
- Asegúrate de que la base de datos está accesible
