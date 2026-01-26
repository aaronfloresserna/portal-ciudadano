# 🔄 Redeploy del Proyecto Existente

## Ya tienes Vercel configurado ✅

Como ya tienes el proyecto en Vercel, solo necesitas actualizar algunas cosas:

## Opción 1: Deploy Automático (Recomendado)

Vercel debería detectar automáticamente el push a GitHub y hacer deploy solo. 

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard
2. Busca tu proyecto "portal-ciudadano"
3. Deberías ver un nuevo deployment en progreso
4. Espera a que termine (2-3 minutos)

## Opción 2: Forzar Redeploy Manual

Si no se deployó automáticamente:

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto "portal-ciudadano"
3. Ve a la pestaña "Deployments"
4. Click en "Redeploy" en el deployment más reciente
5. Confirma el redeploy

## ⚠️ IMPORTANTE: Nuevas Variables de Entorno

Antes de que funcione el sistema nuevo, necesitas agregar estas variables:

### Ve a: Settings → Environment Variables

Agrega estas NUEVAS variables (las que faltan):

#### 1. Variables de Email (Gmail)

**Primero genera una contraseña de aplicación:**
- https://myaccount.google.com/security
- Habilita "Verificación en 2 pasos"
- "Contraseñas de aplicaciones" → Genera nueva
- Copia la contraseña de 16 caracteres

**Luego agrega:**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = tu-email@gmail.com
SMTP_PASSWORD = (contraseña de aplicación de 16 caracteres)
SMTP_FROM = noreply@tsjchihuahua.gob.mx
```

#### 2. Actualizar NEXT_PUBLIC_APP_URL

Verifica que esta variable tenga tu URL real de Vercel:
```
NEXT_PUBLIC_APP_URL = https://tu-proyecto.vercel.app
```

### Después de agregar variables:

1. Ve a "Deployments"
2. Click "Redeploy" en el último deployment
3. Esto aplicará las nuevas variables

## 🗄️ Migraciones de Base de Datos

Las migraciones se ejecutarán automáticamente durante el build porque configuramos:
```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

Si algo falla con las migraciones, puedes ejecutarlas manualmente:

### Opción A: Desde Vercel CLI
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Opción B: Revisar logs
1. Ve a tu deployment en Vercel
2. Click en "View Build Logs"
3. Busca errores relacionados con Prisma
4. Si ves "Migration applied successfully" ✅ está bien

## ✅ Verificar que Todo Funciona

Una vez que el deployment termine:

1. Abre tu URL de Vercel
2. Registra un nuevo usuario
3. Crea un trámite de divorcio
4. Completa los datos del Cónyuge 1
5. Verás la página de invitación ✅
6. Ingresa un email y envía invitación
7. Verifica que el email llegue ✅
8. Abre el email y acepta la invitación
9. Verifica que las notificaciones funcionen ✅

## 🐛 Si Algo Sale Mal

### Build falla
- Ve a Deployments → View Build Logs
- Busca el error específico
- Probablemente es por variables de entorno faltantes

### Emails no se envían
- Verifica la contraseña de aplicación de Gmail
- Asegúrate de usar la contraseña de aplicación, NO tu contraseña normal
- Revisa los Function Logs en Vercel

### Base de datos da error
- Verifica que la base de datos Vercel Postgres esté activa
- Ve a Storage → Tu base de datos → Verifica status
- Revisa que las variables DATABASE_URL, etc. estén conectadas

## 📊 Nuevas Características Disponibles

Después del deploy, tendrás:

✨ **Sistema Dual de Usuarios**
- Cónyuge 1 completa sus datos
- Envía invitación por email
- Cónyuge 2 acepta y completa sus datos
- Ambos colaboran en el resto

🔔 **Sistema de Notificaciones**
- Campanilla en el header con contador
- Notificaciones en tiempo real
- Polling automático cada 30 segundos

📧 **Emails Automáticos**
- Invitaciones por email
- Plantillas HTML profesionales
- Links seguros con tokens

## 🎉 ¡Listo!

Tu Portal Ciudadano ahora tiene el sistema dual de usuarios completo.

---

**Dashboard Vercel**: https://vercel.com/dashboard
**GitHub Repo**: https://github.com/aaronfloresserna/portal-ciudadano
