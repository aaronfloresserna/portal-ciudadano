# 🚀 DEPLOY AHORA - Instrucciones Rápidas

## ✅ Código ya está en GitHub

Tu código ya fue subido a: **https://github.com/aaronfloresserna/portal-ciudadano**

## 📝 Pasos para Deployar (5-10 minutos)

### Paso 1: Ir a Vercel

Abre tu navegador y ve a: **https://vercel.com/new**

### Paso 2: Importar tu Repositorio

1. Si no has iniciado sesión, hazlo con tu cuenta de GitHub
2. Vercel te mostrará tus repositorios
3. Busca **"portal-ciudadano"**
4. Click en **"Import"**

### Paso 3: Configurar el Proyecto

Vercel detectará automáticamente que es Next.js. Déjalo así:

- **Framework Preset**: Next.js ✅ (auto-detectado)
- **Root Directory**: ./ ✅
- **Build Command**: `npm run build` ✅ (ya está configurado)
- **Output Directory**: .next ✅

**NO TOQUES NADA MÁS EN ESTA SECCIÓN**

### Paso 4: Configurar Base de Datos

**ANTES de hacer Deploy**, necesitas crear la base de datos:

1. En otra pestaña, ve a: **https://vercel.com/dashboard**
2. Click en **"Storage"** (en el menú lateral)
3. Click en **"Create Database"**
4. Selecciona **"Postgres"**
5. Nombre: `portal-ciudadano-db`
6. Región: **Washington, D.C., USA (iad1)** (o la más cercana)
7. Click **"Create"**
8. Espera a que se cree (toma 1-2 minutos)

### Paso 5: Variables de Entorno

Vuelve a la pestaña donde estás importando el proyecto.

En la sección **"Environment Variables"**, agrega estas variables:

#### 1. JWT_SECRET (IMPORTANTE)
```
JWT_SECRET
```
Valor: Copia y pega esto (o genera uno nuevo con `openssl rand -base64 32`):
```
hQ7xK9mN2pL5sR8vY1bE4gJ6nU3wZ0cF7dH9kM2oP5tA8xC1eG4jL7nQ0sV3yB6
```

#### 2. NEXT_PUBLIC_APP_NAME
```
NEXT_PUBLIC_APP_NAME
```
Valor:
```
Portal Ciudadano
```

#### 3. NEXT_PUBLIC_APP_URL
```
NEXT_PUBLIC_APP_URL
```
Valor: (lo actualizarás después del deploy)
```
https://portal-ciudadano.vercel.app
```

#### 4. UPLOAD_DIR
```
UPLOAD_DIR
```
Valor:
```
./public/uploads
```

#### 5-9. Variables de Email (Gmail - para pruebas)

**IMPORTANTE**: Necesitas generar una contraseña de aplicación de Gmail:

1. Ve a tu cuenta de Google: https://myaccount.google.com/security
2. Busca "Contraseñas de aplicaciones"
3. Si no está habilitado, primero habilita "Verificación en 2 pasos"
4. Luego ve a "Contraseñas de aplicaciones"
5. Selecciona "Correo" y "Otro (nombre personalizado)"
6. Escribe "Portal Ciudadano"
7. Click "Generar"
8. Copia la contraseña de 16 caracteres (sin espacios)

Ahora agrega estas variables en Vercel:

```
SMTP_HOST
```
Valor: `smtp.gmail.com`

```
SMTP_PORT
```
Valor: `587`

```
SMTP_USER
```
Valor: tu-email@gmail.com (reemplaza con tu email)

```
SMTP_PASSWORD
```
Valor: la contraseña de aplicación que generaste (16 caracteres sin espacios)

```
SMTP_FROM
```
Valor: `noreply@tsjchihuahua.gob.mx`

### Paso 6: Conectar la Base de Datos

1. En la sección de **"Environment Variables"**, click en **"Add"**
2. Busca la opción **"Postgres"** o **"Connect Database"**
3. Selecciona la base de datos que creaste (`portal-ciudadano-db`)
4. Vercel agregará automáticamente las variables:
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Paso 7: DEPLOY! 🚀

1. Verifica que todas las variables estén configuradas
2. Click en **"Deploy"**
3. Espera 2-3 minutos mientras Vercel:
   - Instala dependencias
   - Ejecuta las migraciones de base de datos
   - Build del proyecto
   - Deploy

### Paso 8: Actualizar NEXT_PUBLIC_APP_URL

Una vez que el deploy termine:

1. Vercel te dará una URL como: `https://portal-ciudadano-xxxx.vercel.app`
2. Copia esa URL
3. Ve a **Settings → Environment Variables**
4. Edita `NEXT_PUBLIC_APP_URL`
5. Pega la URL real de tu proyecto
6. Click **"Save"**
7. Ve a **"Deployments"**
8. Click en **"Redeploy"** (para aplicar el cambio)

## ✅ Verificar que Funciona

Una vez deployado, abre tu URL y verifica:

1. ✅ La página carga sin errores
2. ✅ Puedes registrar un usuario
3. ✅ Puedes crear un trámite
4. ✅ Puedes enviar una invitación
5. ✅ Recibes el email de invitación

## 🐛 Si Algo Sale Mal

### Error: "Cannot connect to database"
- Ve a Storage → Tu base de datos → Verifica que está activa
- Ve a Settings → Environment Variables → Verifica que las variables de DB están ahí

### Error: "Build failed"
- Ve a Deployments → Click en el deploy fallido → View Build Logs
- Busca el error específico
- Generalmente es por variables de entorno faltantes

### Los emails no se envían
- Verifica que usaste la "Contraseña de aplicación" de Gmail, no tu contraseña normal
- Verifica que las variables SMTP estén correctas (sin espacios extra)
- Revisa los logs en Deployments → Function Logs

## 📞 Necesitas Ayuda?

Si algo no funciona:
1. Revisa los logs en Vercel: Deployments → Tu deploy → View Logs
2. Verifica las variables de entorno en Settings
3. Asegúrate de que la base de datos esté conectada

## 🎉 ¡Listo!

Una vez que todo funcione, tendrás tu Portal Ciudadano funcionando en:
**https://tu-proyecto.vercel.app**

---

**Repositorio GitHub**: https://github.com/aaronfloresserna/portal-ciudadano
**Dashboard Vercel**: https://vercel.com/dashboard

¡Éxito con tu deployment! 🚀
