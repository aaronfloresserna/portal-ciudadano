# Diseño: Migración AWS — Portal Ciudadano

**Fecha:** 2026-04-16
**Estado:** En revisión

## Contexto

El portal ciudadano de Chihuahua corre en Vercel (Next.js 16) con Neon PostgreSQL. Los archivos se almacenan como base64 data URI en la columna `path` de `Documento` (workaround del límite de 4.5MB de Vercel serverless). El email se envía con nodemailer vía SMTP genérico.

Este plan migra tres servicios de infraestructura a AWS, dejando el compute (Next.js en Vercel) sin cambios.

## Alcance

| Componente | Antes | Después |
|---|---|---|
| Next.js app | Vercel | Vercel (sin cambio) |
| Base de datos | Neon PostgreSQL | AWS RDS PostgreSQL |
| Archivos | Base64 data URI en DB | AWS S3 (presigned PUT URLs) |
| Email | nodemailer SMTP genérico | AWS SES (SMTP compatible) |

---

## 1. Base de datos — Neon → RDS

### Estado actual

El proyecto usa `@prisma/adapter-pg` (ya instalado) con `@neondatabase/serverless` como driver. El cambio es solo en la instancia del Pool — Prisma y el adapter `PrismaPg` se mantienen.

### Cambios de código

**`src/lib/db.ts`**: reemplazar `Pool` de `@neondatabase/serverless` por `Pool` de `pg`.

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Certificado CA de RDS
})
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Eliminar dependencias: `@neondatabase/serverless`, `ws`, `@types/ws`.

### Conectividad Vercel → RDS

Vercel serverless conecta por internet (sin VPC peering nativo). RDS debe configurarse como **públicamente accesible** con:
- Security Group: puerto 5432 abierto a `0.0.0.0/0` (SSL obligatorio mitiga el riesgo)
- `sslmode=require` en la connection string

### Migración de datos

1. Dump de Neon: `pg_dump $NEON_DATABASE_URL --no-owner --no-acl -f dump.sql`
2. Restore en RDS: `psql $RDS_DATABASE_URL -f dump.sql`
3. Verificar integridad: contar filas en `tramite`, `usuario`, `documento`, `tramiteParticipante`, `invitacion`
4. Mantener Neon activo hasta confirmar 48h de estabilidad en producción

### Rollback DB

Neon permanece activo durante todo el proceso. Rollback = revertir `DATABASE_URL` en Vercel + redeploy (~30 segundos).

### Variables de entorno

```
DATABASE_URL=postgresql://user:pass@{rds-endpoint}:5432/portal_ciudadano?sslmode=require
```

---

## 2. Archivos — Base64 en DB → S3 con Presigned PUT URLs

### Límite de tamaño

Nuevo límite: **20MB**, enforceado vía condición `ContentLengthRange` en la presigned URL. El límite de 4.5MB de Vercel desaparece (el archivo nunca pasa por el servidor).

### S3 key format

```
tramites/{tramiteId}/{tipo}_{timestampMs}_{random8hex}.{ext}
```

Ejemplo: `tramites/cm1abc123/acta_matrimonio_1713280000000_a3f9b2c1.pdf`

La extensión se deriva del `mimeType`: `image/jpeg` → `.jpg`, `image/png` → `.png`, `application/pdf` → `.pdf`.

El endpoint de registro valida que el `key` recibido empiece con `tramites/{tramiteId}/` para evitar cross-tramite spoofing.

### Campo `path` en `Documento`

| Estado | Valor de `path` |
|---|---|
| Antes (base64) | `data:application/pdf;base64,JVBERi0...` |
| Después (S3) | `tramites/cm1abc123/acta_1713280000000_a3f9.pdf` |

El campo no cambia de tipo en el schema Prisma. El código detecta si `path` empieza con `data:` (legacy) o no (S3 key) para servir el archivo correctamente.

### Flujo completo (cónyuge 1 — JWT)

```
1. Cliente → POST /api/documentos/presign
             Body: { tramiteId, tipo, mimeType, size, nombreArchivo }
           ← { uploadUrl, key }    (PUT presigned URL, expira 15 min)

2. Cliente → PUT {uploadUrl}
             Headers: Content-Type: {mimeType}
             Body: archivo binario
           ← 200 OK de S3

3. Cliente → POST /api/documentos
             Body: { key, tramiteId, tipo, mimeType, size, nombreArchivo }
           ← { success: true, documento: { id, tramiteId, tipo, path, mimeType, size, nombreArchivo, createdAt } }
```

### Flujo completo (cónyuge 2 — token)

Mismo flujo de 3 pasos pero usando:
- Paso 1: `POST /api/documentos/public/presign` con header `X-Invitacion-Token`
- Paso 3: `POST /api/documentos/public` con header `X-Invitacion-Token`

### API routes nuevas/modificadas

#### `POST /api/documentos/presign` (nueva — cónyuge 1)
- Auth: `getUserIdFromRequest` (JWT)
- Body: `{ tramiteId: string, tipo: string, mimeType: string, size: number, nombreArchivo: string }`
- Verifica participante del trámite
- Valida `mimeType` ∈ `['image/jpeg', 'image/png', 'application/pdf']`
- Genera key según formato canónico
- Genera presigned PUT con:
  - `ContentType` = mimeType
  - `ContentLengthRange`: [1, 20971520]
  - Expiración: 900s (15 min)
- Retorna `{ uploadUrl, key }`

#### `POST /api/documentos/public/presign` (nueva — cónyuge 2)
- Auth: header `X-Invitacion-Token`
- Verifica `invitacion.estado === 'PENDIENTE'` y que `tramiteId` corresponda a la invitación
- Misma lógica de generación que el anterior
- Retorna `{ uploadUrl, key }`

#### `POST /api/documentos` (modificado)
- Antes: recibía `FormData` con archivo
- Ahora: recibe JSON `{ key, tramiteId, tipo, mimeType, size, nombreArchivo }`
- Valida que `key` empiece con `tramites/{tramiteId}/`
- Guarda en DB con `path = key`
- Retorna documento creado

#### `POST /api/documentos/public` (modificado)
- Misma lógica que el anterior pero con auth por token

#### `GET /api/documentos/[id]/url` (nueva)
- Auth: JWT o token según tipo de usuario
- Genera presigned GET URL (expiración 60 min) para el `key` almacenado en `path`
- Si `path` empieza con `data:` (documento legacy): retorna `{ url: path }` directamente (el data URI ya es la URL)
- Retorna `{ url }` — el cliente usa esta URL para mostrar/descargar el archivo

### Cambios en componentes

#### `FileUploadQuestion.tsx` y `HijosFormQuestion.tsx`

El componente acepta una prop `presignEndpoint` que determina qué endpoint usar:
- Cónyuge 1: `presignEndpoint = '/api/documentos/presign'`
- Cónyuge 2: `presignEndpoint = '/api/documentos/public/presign'` (con header adicional)

**Estados del componente:**
```
idle → presigning → uploading → registering → done | error
```

**Lógica de retry en paso 2 (PUT a S3):**
- Error 403: único caso que reintenta presign automáticamente (URL expirada). Máximo 1 reintento.
- Error de red / timeout: no reintenta, muestra "Error de conexión. Intenta de nuevo."
- Cualquier otro error HTTP: no reintenta, muestra "Error al subir archivo ({status})."
- Si el reintento de presign también falla: muestra "No se pudo conectar con el servidor."

### Servir documentos existentes (base64) después de migración

Antes de correr el script de migración, el nuevo código de display está en producción. El campo `path` puede contener:
- Data URI (`data:...`) → se retorna directamente en `GET /api/documentos/[id]/url`
- S3 key → se genera presigned GET URL

Esta lógica dual garantiza que documentos no migrados aún sean accesibles.

### Script de migración base64 → S3 (`scripts/migrate-docs-to-s3.ts`)

**Idempotente**: saltea documentos cuyo `path` no empiece con `data:`.

```
Para cada documento donde path LIKE 'data:%':
  1. Parsear data URI: extraer mimeType y base64
  2. Decodificar buffer
  3. Generar key: tramites/{tramiteId}/{tipo}_{doc.id}.{ext}
  4. PUT buffer a S3
  5. UPDATE documento SET path = key WHERE id = doc.id
  6. Log: "✓ migrado {id}"
En error de cualquier fila: log error + continuar (no abortar)
```

Flags: `--dry-run` (no escribe nada) y `--limit N` (probar con N primero).

**Rollback script**: como el base64 original estaba en DB y el script lo reemplaza con el key, el rollback requiere restaurar un dump pre-migración. Por eso el dump de Neon debe conservarse.

### Rollback S3

Si el código S3 está en producción pero falla:
1. Revertir el deploy de Vercel al commit anterior (Vercel permite instant rollback)
2. Los documentos subidos a S3 pero no registrados en DB se limpian con Lifecycle rule (24h)
3. Los documentos registrados con S3 key en DB que no se puedan servir: si el dump de DB está disponible, restaurar las filas afectadas

### Configuración S3

**CORS:**
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT"],
  "AllowedOrigins": [
    "https://portal-ciudadano.vercel.app",
    "https://*.vercel.app"
  ],
  "ExposeHeaders": []
}]
```

El wildcard `*.vercel.app` cubre deployments de preview. Aceptable porque los presigned URLs tienen expiración y solo son válidos para el bucket del portal.

**Lifecycle rule**: eliminar objetos no completados y objetos sin registro en DB es difícil de automatizar con reglas nativas (S3 no conoce el estado de la DB). En su lugar: S3 Incomplete Multipart Upload cleanup (aunque aquí no hay multipart) y revisión manual periódica.

**IAM user permisos mínimos:**
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::portal-ciudadano-docs/tramites/*"
}
```

### Variables de entorno nuevas

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=portal-ciudadano-docs
```

---

## 3. Email — nodemailer SMTP → SES

### Pre-requisitos (hacer antes del deploy, en paralelo con el resto)

1. Verificar dominio remitente en SES (registros DKIM en DNS)
2. **Solicitar salida del sandbox de SES** a AWS Support (1–2 días hábiles). Sin esto, SES solo envía a direcciones verificadas. El deploy de SES está **bloqueado** hasta tener confirmación de aprobación.
3. Crear credenciales SMTP desde la consola SES (distintas a IAM keys — generadas en SES → SMTP settings)
4. **Smoke test** con dirección verificada antes del cutover: enviar invitación de prueba y verificar entrega

### Cambios de código

**`src/lib/email.ts`**: solo cambian las credenciales del transporter.

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,       // email-smtp.us-east-1.amazonaws.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,     // credencial SMTP de SES (no IAM key)
    pass: process.env.SES_SMTP_PASSWORD,
  },
})
```

### Variables de entorno

```
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_USER=AKIAxxxxxxxxx
SES_SMTP_PASSWORD=xxxxxxxxx
```

---

## 4. Orden de implementación

| Paso | Tarea | Prerequisito | Paralelo con |
|---|---|---|---|
| 1 | Proveer RDS, pg_dump Neon → psql RDS | — | Paso 3 |
| 2 | Actualizar `db.ts`, deploy con nueva `DATABASE_URL` | Paso 1 verificado | — |
| 3 | Crear bucket S3, IAM, CORS | — | Paso 1 |
| 4 | Implementar presign routes + modificar componentes upload | Paso 3 | Solicitud SES sandbox |
| 5 | Deploy código S3 con nuevas env vars | Paso 4 | — |
| 6 | Correr migration script (--dry-run, luego real) | Paso 5 en producción | — |
| 7 | Confirmar aprobación sandbox SES + smoke test | Solicitud previa aprobada | — |
| 8 | Actualizar `email.ts`, deploy con vars SES | Paso 7 | — |
| 9 | Cleanup: remover deps Neon/ws, apagar Neon | Todo estable 48h | — |

---

## Dependencias

Agregar:
```
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

Eliminar:
```
@neondatabase/serverless
ws
@types/ws
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Downtime en cutover DB | Neon activo como fallback; rollback = revertir `DATABASE_URL` (~30s) |
| Archivos legacy rotos post-deploy | Lógica dual en `GET /api/documentos/[id]/url`: data URI directo o presigned GET |
| SES sandbox bloquea emails | Deploy SES bloqueado hasta confirmación de sandbox exit |
| CORS bloqueando uploads | Configurar CORS antes de deploy; wildcard `*.vercel.app` para previews |
| S3 rollback complicado | Instant rollback en Vercel al commit anterior; dump pre-migración conservado |
| Presigned URL expirada | Auto-retry presign (1 vez); otros errores S3 → mensaje de usuario |
| RDS accesible desde internet | SSL obligatorio (`sslmode=require`); Security Group en puerto 5432 |
