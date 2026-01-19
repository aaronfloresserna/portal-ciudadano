# 🚀 Deploy a Vercel

Guía rápida para desplegar Portal Ciudadano en Vercel con Neon PostgreSQL.

## 📋 Pre-requisitos

1. ✅ Cuenta de GitHub con el repo `portal-ciudadano`
2. ✅ Base de datos PostgreSQL en Neon creada
3. ✅ Cuenta de Vercel (gratis)

## 🗄️ Paso 1: Obtener Connection String de Neon

1. Ve a tu proyecto en [Neon Dashboard](https://console.neon.tech)
2. Clic en **"Connect"**
3. Copia el connection string completo:
   ```
   postgresql://neondb_owner:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```

## ☁️ Paso 2: Deploy en Vercel

### 2.1 Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Clic en **"Add New"** → **"Project"**
3. Importa el repo **`portal-ciudadano`**

### 2.2 Configurar variables de entorno

Antes de hacer deploy, agrega estas variables:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:tu_password@ep-xxxx.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Auth (genera uno nuevo con: openssl rand -base64 32)
JWT_SECRET=tu-secreto-super-seguro-cambiar-esto-123456789

# App
NEXT_PUBLIC_APP_NAME=Portal Ciudadano
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

### 2.3 Configuración de build

Vercel detecta automáticamente Next.js, pero verifica:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (o déjalo vacío para auto-detect)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.4 Deploy

1. Clic en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! 🎉

## 🔧 Paso 3: Ejecutar migraciones

Después del primer deploy:

1. Ve a tu proyecto en Vercel
2. Clic en **"Settings"** → **"Environment Variables"**
3. Confirma que `DATABASE_URL` esté configurada
4. Ve a **"Deployments"**
5. En el último deployment exitoso, busca los logs
6. Las migraciones deberían ejecutarse automáticamente

Si no se ejecutan automáticamente, conéctate localmente:

```bash
# En tu máquina local
export DATABASE_URL="postgresql://neondb_owner:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy
```

## 🧪 Paso 4: Probar la app

1. Ve a tu URL de Vercel: `https://portal-ciudadano.vercel.app`
2. Clic en **"Registro"**
3. Crea un usuario de prueba
4. Prueba el flujo completo

## 📝 Crear usuario de prueba

Opción 1: Desde la UI (Registro)

Opción 2: Desde Neon SQL Editor:

```sql
INSERT INTO usuarios (id, email, password, nombre, "createdAt", "updatedAt")
VALUES (
  'test001',
  'fidel.leon@portal.com',
  '$2b$10$X6YZ...', -- hash de "fidel123" (usa bcrypt)
  'Fidel León',
  NOW(),
  NOW()
);
```

## 🔄 Actualizaciones futuras

Cada vez que hagas push a `master`, Vercel desplegará automáticamente:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin master
```

## 🐛 Troubleshooting

### Error: "Prisma Client not initialized"

**Solución**: Asegúrate de que `postinstall` esté en package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Error: "Database connection failed"

**Solución**: 
1. Verifica que `DATABASE_URL` en Vercel esté correcta
2. Incluye `?sslmode=require` al final del connection string
3. Reinicia el deployment

### Los uploads no funcionan

**Nota**: Vercel tiene sistema de archivos efímero. Los uploads se perderán en cada deploy.

**Solución para producción**: Usar storage externo (S3, Cloudinary, Vercel Blob, etc.)

## 📊 Monitoreo

- **Logs**: Vercel Dashboard → Tu proyecto → Logs
- **Analytics**: Vercel Dashboard → Analytics
- **Database**: Neon Dashboard → Monitoring

---

## 🎯 Checklist de Deploy

- [ ] Base de datos Neon creada
- [ ] Connection string copiado
- [ ] Repo en GitHub actualizado
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy ejecutado exitosamente
- [ ] Migraciones aplicadas
- [ ] Usuario de prueba creado
- [ ] Flujo completo probado

---

**¡Listo para producción!** 🚀
