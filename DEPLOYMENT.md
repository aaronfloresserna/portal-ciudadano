# Guía de Deployment en Vercel

Esta guía te ayudará a deployar el Portal Ciudadano en Vercel con base de datos PostgreSQL.

## Requisitos Previos

1. Cuenta de Vercel (https://vercel.com)
2. Cuenta de GitHub (para conectar el repositorio)
3. Cuenta de Gmail o servidor SMTP para enviar emails

## Paso 1: Preparar el Repositorio Git

Si aún no tienes un repositorio Git:

```bash
git init
git add .
git commit -m "Initial commit - Portal Ciudadano con sistema dual-user"
```

Crear repositorio en GitHub y subirlo:

```bash
git remote add origin https://github.com/tu-usuario/portal-ciudadano.git
git branch -M main
git push -u origin main
```

## Paso 2: Crear Base de Datos en Vercel

1. Ve a https://vercel.com/dashboard
2. Click en "Storage" en el menú lateral
3. Click en "Create Database"
4. Selecciona "Postgres"
5. Dale un nombre (ej: `portal-ciudadano-db`)
6. Selecciona la región más cercana a tus usuarios
7. Click en "Create"

Vercel te proporcionará las variables de entorno automáticamente.

## Paso 3: Crear Proyecto en Vercel

1. En el dashboard de Vercel, click en "Add New..." → "Project"
2. Importa tu repositorio de GitHub
3. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (ya incluye migraciones)
   - **Output Directory**: .next

## Paso 4: Configurar Variables de Entorno

En la sección "Environment Variables" de tu proyecto en Vercel, agrega:

### Variables de Base de Datos (Auto-generadas si conectaste Vercel Postgres)
- `DATABASE_URL` - Vercel lo proporciona automáticamente
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Variables de Autenticación
- `JWT_SECRET` - Genera uno seguro: `openssl rand -base64 32`

### Variables de la Aplicación
- `NEXT_PUBLIC_APP_NAME` = `Portal Ciudadano`
- `NEXT_PUBLIC_APP_URL` = `https://tu-app.vercel.app` (actualiza con tu URL real)
- `UPLOAD_DIR` = `./public/uploads`

### Variables de Email (SMTP)

**Opción A: Usar Gmail (Recomendado para pruebas)**

1. Ve a tu cuenta de Google → Seguridad
2. Activa "Verificación en 2 pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva contraseña de aplicación
5. Usa estas variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx (contraseña de aplicación)
SMTP_FROM=noreply@tsjchihuahua.gob.mx
```

**Opción B: Usar SendGrid (Recomendado para producción)**

1. Crea cuenta en SendGrid (https://sendgrid.com)
2. Verifica tu dominio
3. Crea API Key
4. Usa estas variables:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=tu-sendgrid-api-key
SMTP_FROM=noreply@tsjchihuahua.gob.mx
```

## Paso 5: Deploy

1. Click en "Deploy"
2. Espera a que termine el build (incluye las migraciones automáticas)
3. Una vez completado, Vercel te dará una URL

## Paso 6: Verificar Migraciones

Si necesitas ejecutar migraciones manualmente:

1. En tu proyecto de Vercel, ve a "Settings" → "Functions"
2. O usa Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

## Paso 7: Probar el Sistema

### Prueba del Flujo Completo:

1. **Registro Cónyuge 1**
   - Ve a tu URL de Vercel
   - Registra una cuenta con tu email
   - Inicia sesión

2. **Crear Trámite**
   - Click en "Nuevo Trámite de Divorcio"
   - Completa los datos personales del Cónyuge 1 (pasos 2-7)
   - Al finalizar, serás redirigido a la página de invitación

3. **Enviar Invitación**
   - Ingresa el email del Cónyuge 2 (usa otro email tuyo)
   - Click en "Enviar Invitación"
   - Revisa tu email

4. **Aceptar Invitación (Cónyuge 2)**
   - Abre el email recibido
   - Click en el link de invitación
   - Registra una nueva cuenta con el email invitado
   - Acepta la invitación
   - Completa los datos personales del Cónyuge 2 (pasos 8-13)

5. **Completar Trámite Juntos**
   - Cualquiera de los dos puede continuar
   - Completen los datos del matrimonio, hijos, etc.
   - Firmen el convenio
   - Generen el PDF

### Verificar Notificaciones:

- Verifica que la campanilla de notificaciones muestre el contador
- Click en la campanilla para ver las notificaciones
- Verifica que las notificaciones se marquen como leídas

## Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté configurado en Vercel
- Asegúrate de que Vercel Postgres esté activo

### Error: "Migration failed"
- Ve a los logs de build en Vercel
- Si falla, ejecuta manualmente: `vercel env pull && npx prisma migrate deploy`

### Los emails no se envían
- Verifica las credenciales SMTP en las variables de entorno
- Si usas Gmail, asegúrate de usar "Contraseña de aplicación"
- Revisa los logs de Vercel para ver errores

### Las notificaciones no aparecen
- Verifica que el Header esté usando 'use client'
- Revisa la consola del navegador para errores
- Verifica que el polling esté activo

## Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ejecutar migraciones
vercel env pull .env.local
npx prisma migrate deploy

# Ver base de datos (localmente)
npx prisma studio

# Re-deploy
vercel --prod
```

## Seguridad en Producción

Antes de lanzar a producción real:

1. ✅ Cambia `JWT_SECRET` a algo único y seguro
2. ✅ Usa un servicio de email profesional (SendGrid, AWS SES)
3. ✅ Configura un dominio personalizado en Vercel
4. ✅ Habilita HTTPS (Vercel lo hace automáticamente)
5. ✅ Revisa y actualiza las políticas de CORS si es necesario
6. ✅ Configura límites de rate limiting
7. ✅ Implementa backups de la base de datos

## Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
