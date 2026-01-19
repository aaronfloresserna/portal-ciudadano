# ✅ Sistema de Autenticación Completado

El sistema de autenticación está completo y listo para probarse.

## 🎉 Lo que se ha implementado

### API Routes (Backend)
- ✅ `POST /api/auth/register` - Registro de usuarios
- ✅ `POST /api/auth/login` - Inicio de sesión
- ✅ `GET /api/auth/me` - Obtener usuario actual

### Páginas (Frontend)
- ✅ `/` - Página principal (redirecciona a login o dashboard)
- ✅ `/login` - Formulario de inicio de sesión
- ✅ `/registro` - Formulario de registro
- ✅ `/dashboard` - Dashboard del usuario

### Componentes UI
- ✅ Button - Botón reutilizable con variantes
- ✅ Input - Input con estilos consistentes
- ✅ Label - Label para formularios
- ✅ Card - Tarjetas para UI

### Funcionalidades
- ✅ Registro de usuarios con validación Zod
- ✅ Login con JWT
- ✅ Persistencia de sesión con Zustand + localStorage
- ✅ Protección de rutas
- ✅ Logout funcional
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de CURP (opcional)

---

## 🚀 Cómo Probar el Sistema

### Paso 1: Asegúrate de que Docker esté corriendo
```bash
# Verifica que Docker Desktop esté abierto
docker ps
```

Deberías ver el contenedor `portal-ciudadano-db`.

Si no está corriendo:
```bash
docker-compose up -d
```

### Paso 2: Crear las tablas en la base de datos

**IMPORTANTE**: Si ya ejecutaste esto antes, omite este paso.

```bash
# Esto creará las tablas en PostgreSQL
npx prisma migrate dev --name init
```

### Paso 3: Iniciar el servidor de desarrollo
```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📝 Flujo de Prueba Completo

### 1. Registrar un Usuario

1. Abre http://localhost:3000
2. Serás redirigido a `/login`
3. Click en **"Regístrate aquí"**
4. Llena el formulario:
   - **Nombre**: Juan Pérez
   - **Email**: juan@ejemplo.com
   - **Teléfono**: 6141234567 (opcional)
   - **Contraseña**: 123456
5. Click en **"Crear cuenta"**

✅ **Resultado esperado**:
- Serás registrado automáticamente
- Redirigido al dashboard
- Verás un mensaje de bienvenida con tu nombre

### 2. Cerrar Sesión

1. En el dashboard, click en **"Cerrar sesión"**

✅ **Resultado esperado**:
- Serás redirigido a `/login`
- Tu sesión se habrá borrado

### 3. Iniciar Sesión

1. En `/login`, ingresa tus credenciales:
   - **Email**: juan@ejemplo.com
   - **Contraseña**: 123456
2. Click en **"Iniciar sesión"**

✅ **Resultado esperado**:
- Inicio de sesión exitoso
- Redirigido al dashboard
- Tu sesión se mantiene incluso si refrescas la página

### 4. Persistencia de Sesión

1. Con sesión iniciada, refresca la página (F5)
2. Cierra y abre la pestaña del navegador
3. Ve a http://localhost:3000

✅ **Resultado esperado**:
- Sigues autenticado
- Eres redirigido automáticamente al dashboard
- No necesitas iniciar sesión de nuevo

---

## 🔍 Ver los Datos en la Base de Datos

Puedes usar Prisma Studio para ver los usuarios registrados:

```bash
npx prisma studio
```

Esto abrirá http://localhost:5555 donde podrás:
- Ver la tabla `usuarios`
- Ver los usuarios registrados
- Ver los campos: id, email, nombre, telefono, contraseñas hasheadas

---

## 🧪 Probar las APIs Directamente

### Registrar Usuario (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@ejemplo.com",
    "password": "123456",
    "nombre": "María García",
    "telefono": "6149876543"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "...",
    "email": "maria@ejemplo.com",
    "nombre": "María García",
    "telefono": "6149876543",
    "createdAt": "2026-01-16T..."
  }
}
```

### Login (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@ejemplo.com",
    "password": "123456"
  }'
```

### Obtener Usuario Actual (cURL)
```bash
# Reemplaza TOKEN con el token obtenido del login
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎨 Capturas de lo que deberías ver

### `/registro` - Formulario de Registro
- Card blanca centrada
- 4 campos: Nombre, Email, Teléfono, Contraseña
- Botón azul "Crear cuenta"
- Link a "Inicia sesión" abajo

### `/login` - Formulario de Login
- Card blanca centrada
- 2 campos: Email, Contraseña
- Botón azul "Iniciar sesión"
- Link a "Regístrate aquí" abajo

### `/dashboard` - Dashboard
- Header blanco con título "Portal Ciudadano"
- Saludo con nombre del usuario y botón "Cerrar sesión"
- 3 cards principales:
  - Nuevo Trámite
  - Mis Trámites
  - Mi Perfil
- 2 cards informativos abajo

---

## ✅ Validaciones Implementadas

### Registro
- ✅ Email válido requerido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Nombre mínimo 2 caracteres
- ✅ Email debe ser único (no duplicados)
- ✅ Teléfono opcional

### Login
- ✅ Email requerido
- ✅ Contraseña requerida
- ✅ Credenciales verificadas contra BD
- ✅ Error si credenciales inválidas

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Module not found: Can't resolve '@/...'"
El proyecto está usando la estructura `/src`, verifica que tsconfig.json tenga:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### La sesión no persiste al refrescar
Verifica que el navegador permita localStorage. Abre DevTools > Application > Local Storage y busca `auth-storage`.

---

## 📊 Estructura de la Base de Datos

```sql
-- Tabla usuarios
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- Hash bcrypt
  nombre TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Próximos Pasos

Ahora que la autenticación funciona, los siguientes pasos son:

### Semana 1 Completada ✅
- [x] API Routes de autenticación
- [x] Páginas de login y registro
- [x] Dashboard básico
- [x] Componentes UI base

### Semana 2: Formulario de Divorcio (Siguiente)
- [ ] API de trámites (CRUD)
- [ ] Componente StepWizard
- [ ] Formulario paso 1: Cónyuge 1
- [ ] Formulario paso 2: Cónyuge 2
- [ ] Formulario paso 3: Datos del matrimonio

¿Listo para continuar con el formulario de divorcio?

---

**Estado**: ✅ Autenticación Completada
**Fecha**: 16 de Enero 2026
**Tiempo estimado**: ~4 horas de desarrollo
