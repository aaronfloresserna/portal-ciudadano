# AWS Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate portal ciudadano from Neon PostgreSQL + base64-in-DB files + generic SMTP to AWS RDS + S3 presigned URLs + SES, without changing the Vercel hosting.

**Architecture:** Three independent backend migrations executed in sequence. No schema changes required — Prisma ORM and all API contracts stay the same from the frontend's perspective. Files move from base64 data URIs stored in DB to S3 keys with on-demand presigned URLs for access.

**Tech Stack:** Next.js 16, Prisma + @prisma/adapter-pg, pg.Pool (standard), @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, nodemailer (stays), AWS RDS PostgreSQL, AWS S3, AWS SES

**Spec:** `docs/superpowers/specs/2026-04-16-aws-migration-design.md`

---

## Chunk 1: Database — Neon → RDS

### Task 1: Provision RDS instance (infrastructure — manual)

**Files:** None (AWS console / CLI)

- [ ] **Step 1: Create RDS PostgreSQL instance**

  In AWS Console → RDS → Create database:
  - Engine: PostgreSQL 16
  - Template: Free tier (or Production as needed)
  - DB instance identifier: `portal-ciudadano-db`
  - Master username: `postgres`
  - Master password: choose a strong password, save it
  - DB name: `portal_ciudadano`
  - Public access: **Yes** (required for Vercel serverless)
  - VPC security group: create new or use default

- [ ] **Step 2: Configure Security Group**

  In the RDS instance's Security Group, add inbound rule:
  - Type: PostgreSQL
  - Port: 5432
  - Source: `0.0.0.0/0` (Vercel IPs are not static)

- [ ] **Step 3: Note the RDS endpoint**

  From the RDS instance details, copy the endpoint. It looks like:
  `portal-ciudadano-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`

- [ ] **Step 4: Verify connectivity from local machine**

  ```bash
  psql "postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/portal_ciudadano?sslmode=require"
  ```
  Expected: psql prompt (`portal_ciudadano=#`)

---

### Task 2: Migrate data from Neon to RDS

**Files:** None (CLI commands)

- [ ] **Step 1: Get current Neon DATABASE_URL**

  From Vercel project settings → Environment Variables, copy the current `DATABASE_URL` (Neon).

- [ ] **Step 2: Dump data from Neon**

  ```bash
  pg_dump "$NEON_DATABASE_URL" --no-owner --no-acl -f /tmp/portal-dump.sql
  ```
  Expected: file `/tmp/portal-dump.sql` created (no errors)

- [ ] **Step 3: Restore to RDS**

  ```bash
  psql "postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/portal_ciudadano?sslmode=require" -f /tmp/portal-dump.sql
  ```
  Expected: output ends with no ERROR lines. Some NOTICE lines are normal.

- [ ] **Step 4: Verify integrity**

  ```bash
  psql "postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/portal_ciudadano?sslmode=require" \
    -c "SELECT 'tramite' as t, COUNT(*) FROM tramite UNION ALL SELECT 'usuario', COUNT(*) FROM usuario UNION ALL SELECT 'documento', COUNT(*) FROM documento UNION ALL SELECT 'tramite_participante', COUNT(*) FROM tramite_participante;"
  ```
  Expected: counts match the same query run against Neon.

---

### Task 3: Update db.ts to use pg.Pool instead of Neon driver

**Files:**
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Update src/lib/db.ts**

  Replace the entire file content with:

  ```typescript
  import { PrismaClient } from '@prisma/client'
  import { PrismaPg } from '@prisma/adapter-pg'
  import { Pool } from 'pg'

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
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

- [ ] **Step 2: Remove Neon dependencies**

  ```bash
  npm uninstall @neondatabase/serverless ws
  npm uninstall --save-dev @types/ws
  ```
  Expected: `package.json` no longer contains those three packages.

- [ ] **Step 3: Test locally against RDS**

  Add to `.env.local` temporarily:
  ```
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/portal_ciudadano?sslmode=require
  ```

  Run the dev server:
  ```bash
  npm run dev
  ```
  Expected: server starts, no DB connection errors in console.

  Test: open `http://localhost:3000` and login. If tramites load, DB is working.

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/db.ts package.json package-lock.json
  git commit -m "feat: migrate DB driver from Neon serverless to pg.Pool for RDS"
  ```

---

### Task 4: Deploy DB migration to production

**Files:** None (Vercel env vars)

- [ ] **Step 1: Update DATABASE_URL in Vercel**

  In Vercel project → Settings → Environment Variables:
  - Change `DATABASE_URL` to:
    `postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/portal_ciudadano?sslmode=require`

- [ ] **Step 2: Deploy to production**

  ```bash
  git push origin master
  ```
  Wait for Vercel build to complete.

- [ ] **Step 3: Smoke test production**

  - Open `https://portal-ciudadano.vercel.app`
  - Login with a real account
  - Verify tramites load at `/mis-tramites`
  - Check Vercel logs for any DB errors

- [ ] **Step 4: Keep Neon active as standby for 48h**

  Do not delete the Neon database yet. If anything fails, rollback by reverting `DATABASE_URL` in Vercel settings to the old Neon URL and redeploying.

---

## Chunk 2: File Storage — Base64 in DB → S3 Presigned URLs

### Task 5: Set up AWS S3 bucket (infrastructure — manual)

**Files:** None (AWS console)

- [ ] **Step 1: Create S3 bucket**

  In AWS Console → S3 → Create bucket:
  - Bucket name: `portal-ciudadano-docs`
  - Region: `us-east-1` (or same as RDS)
  - Block all public access: **ON** (bucket is private)
  - Versioning: off (not needed)

- [ ] **Step 2: Configure CORS on the bucket**

  In the bucket → Permissions → CORS, paste:
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT"],
      "AllowedOrigins": [
        "https://portal-ciudadano.vercel.app",
        "https://*.vercel.app"
      ],
      "ExposeHeaders": []
    }
  ]
  ```

- [ ] **Step 3: Create IAM user for the portal**

  In AWS Console → IAM → Users → Create user:
  - Username: `portal-ciudadano-app`
  - Access type: Programmatic (access key + secret)

  Attach inline policy:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::portal-ciudadano-docs/tramites/*"
    }]
  }
  ```

  Save the Access Key ID and Secret Access Key.

---

### Task 6: Add AWS SDK and S3 utility

**Files:**
- Create: `src/lib/s3.ts`

- [ ] **Step 1: Install AWS SDK packages**

  ```bash
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```

- [ ] **Step 2: Create src/lib/s3.ts**

  ```typescript
  import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
  import crypto from 'crypto'

  export const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const BUCKET = process.env.S3_BUCKET_NAME!

  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
  }

  /** Generate canonical S3 key for a document */
  export function generateS3Key(tramiteId: string, tipo: string, mimeType: string): string {
    const ext = MIME_TO_EXT[mimeType] ?? '.bin'
    const timestamp = Date.now()
    const random = crypto.randomBytes(4).toString('hex')
    return `tramites/${tramiteId}/${tipo}_${timestamp}_${random}${ext}`
  }

  /** Generate a presigned PUT URL (15 min expiry, 20MB max) */
  export async function getPresignedPutUrl(
    key: string,
    mimeType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
    })
    return getSignedUrl(s3, command, { expiresIn: 900 })
  }

  /** Generate a presigned GET URL (60 min expiry) */
  export async function getPresignedGetUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    return getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  /** Returns true if path is a legacy base64 data URI */
  export function isLegacyPath(path: string): boolean {
    return path.startsWith('data:')
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/s3.ts package.json package-lock.json
  git commit -m "feat: add S3 client utility and AWS SDK dependencies"
  ```

---

### Task 7: Create presign API routes

**Files:**
- Create: `src/app/api/documentos/presign/route.ts`
- Create: `src/app/api/documentos/public/presign/route.ts`

- [ ] **Step 1: Create src/app/api/documentos/presign/route.ts**

  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { prisma } from '@/lib/db'
  import { getUserIdFromRequest } from '@/lib/auth'
  import { generateS3Key, getPresignedPutUrl } from '@/lib/s3'

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  const MAX_SIZE = 20 * 1024 * 1024 // 20MB

  export async function POST(request: NextRequest) {
    try {
      const userId = getUserIdFromRequest(request)
      if (!userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }

      const body = await request.json()
      const { tramiteId, tipo, mimeType, size, nombreArchivo } = body

      if (!tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no permitido. Solo JPG, PNG y PDF.' },
          { status: 400 }
        )
      }

      if (size > MAX_SIZE) {
        return NextResponse.json(
          { error: 'El archivo es demasiado grande. Máximo 20MB.' },
          { status: 400 }
        )
      }

      const participante = await prisma.tramiteParticipante.findFirst({
        where: { tramiteId, usuarioId: userId },
      })
      if (!participante) {
        return NextResponse.json({ error: 'Trámite no encontrado o sin acceso' }, { status: 404 })
      }

      const key = generateS3Key(tramiteId, tipo, mimeType)
      const uploadUrl = await getPresignedPutUrl(key, mimeType)

      return NextResponse.json({ uploadUrl, key })
    } catch (error) {
      console.error('Error generando presign URL:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
  }
  ```

- [ ] **Step 2: Create src/app/api/documentos/public/presign/route.ts**

  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { prisma } from '@/lib/db'
  import { generateS3Key, getPresignedPutUrl } from '@/lib/s3'

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  const MAX_SIZE = 20 * 1024 * 1024 // 20MB

  export async function POST(request: NextRequest) {
    try {
      const invitacionToken = request.headers.get('X-Invitacion-Token')
      if (!invitacionToken) {
        return NextResponse.json({ error: 'Token de invitación no proporcionado' }, { status: 401 })
      }

      const body = await request.json()
      const { tramiteId, tipo, mimeType, size, nombreArchivo } = body

      if (!tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
      }

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no permitido. Solo JPG, PNG y PDF.' },
          { status: 400 }
        )
      }

      if (size > MAX_SIZE) {
        return NextResponse.json(
          { error: 'El archivo es demasiado grande. Máximo 20MB.' },
          { status: 400 }
        )
      }

      const invitacion = await prisma.invitacion.findFirst({
        where: {
          token: invitacionToken,
          tramiteId,
          estado: 'PENDIENTE',
          expiraEn: { gt: new Date() },
        },
      })
      if (!invitacion) {
        return NextResponse.json({ error: 'Invitación no válida o expirada' }, { status: 403 })
      }

      const key = generateS3Key(tramiteId, tipo, mimeType)
      const uploadUrl = await getPresignedPutUrl(key, mimeType)

      return NextResponse.json({ uploadUrl, key })
    } catch (error) {
      console.error('Error generando presign URL pública:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/api/documentos/presign/route.ts src/app/api/documentos/public/presign/route.ts
  git commit -m "feat: add presign API routes for S3 direct upload (cónyuge1 and cónyuge2)"
  ```

---

### Task 8: Modify document registration routes

**Files:**
- Modify: `src/app/api/documentos/route.ts`
- Modify: `src/app/api/documentos/public/route.ts`

- [ ] **Step 1: Update POST /api/documentos to accept JSON instead of FormData**

  Replace the `POST` function in `src/app/api/documentos/route.ts` with:

  ```typescript
  export async function POST(request: NextRequest) {
    try {
      const userId = getUserIdFromRequest(request)
      if (!userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }

      const body = await request.json()
      const { key, tramiteId, tipo, mimeType, size, nombreArchivo } = body

      if (!key || !tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
      }

      // Validate key belongs to this tramite (prevent cross-tramite spoofing)
      if (!key.startsWith(`tramites/${tramiteId}/`)) {
        return NextResponse.json({ error: 'Key inválido' }, { status: 400 })
      }

      const participante = await prisma.tramiteParticipante.findFirst({
        where: { tramiteId, usuarioId: userId },
      })
      if (!participante) {
        return NextResponse.json({ error: 'Trámite no encontrado o sin acceso' }, { status: 404 })
      }

      const documento = await prisma.documento.create({
        data: {
          tramiteId,
          tipo,
          nombreArchivo,
          path: key,
          mimeType,
          size,
        },
      })

      return NextResponse.json({ success: true, documento }, { status: 201 })
    } catch (error) {
      console.error('Error al registrar documento:', error)
      return NextResponse.json({ error: 'Error al registrar documento' }, { status: 500 })
    }
  }
  ```

  Keep the existing `GET` function unchanged.

- [ ] **Step 2: Update POST /api/documentos/public to accept JSON instead of FormData**

  Replace the entire file `src/app/api/documentos/public/route.ts` with:

  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { prisma } from '@/lib/db'

  export async function POST(request: NextRequest) {
    try {
      const invitacionToken = request.headers.get('X-Invitacion-Token')
      if (!invitacionToken) {
        return NextResponse.json({ error: 'Token de invitación no proporcionado' }, { status: 401 })
      }

      const body = await request.json()
      const { key, tramiteId, tipo, mimeType, size, nombreArchivo } = body

      if (!key || !tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
      }

      if (!key.startsWith(`tramites/${tramiteId}/`)) {
        return NextResponse.json({ error: 'Key inválido' }, { status: 400 })
      }

      const invitacion = await prisma.invitacion.findFirst({
        where: {
          token: invitacionToken,
          tramiteId,
          estado: 'PENDIENTE',
          expiraEn: { gt: new Date() },
        },
      })
      if (!invitacion) {
        return NextResponse.json({ error: 'Invitación no válida o expirada' }, { status: 403 })
      }

      const documento = await prisma.documento.create({
        data: {
          tramiteId,
          tipo,
          nombreArchivo,
          path: key,
          mimeType,
          size,
        },
      })

      return NextResponse.json({ success: true, documento })
    } catch (error) {
      console.error('Error al registrar documento público:', error)
      return NextResponse.json({ error: 'Error al registrar documento' }, { status: 500 })
    }
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/api/documentos/route.ts src/app/api/documentos/public/route.ts
  git commit -m "feat: update document registration routes to accept S3 key instead of FormData"
  ```

---

### Task 9: Create document URL serving route

**Files:**
- Create: `src/app/api/documentos/[id]/url/route.ts`

- [ ] **Step 1: Create the route**

  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { prisma } from '@/lib/db'
  import { getUserIdFromRequest } from '@/lib/auth'
  import { getPresignedGetUrl, isLegacyPath } from '@/lib/s3'

  export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      // Support both JWT auth and invitation token
      const userId = getUserIdFromRequest(request)
      const invitacionToken = request.headers.get('X-Invitacion-Token')

      if (!userId && !invitacionToken) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }

      const documento = await prisma.documento.findUnique({
        where: { id: params.id },
        include: {
          tramite: {
            include: {
              participantes: true,
              invitaciones: true,
            },
          },
        },
      })

      if (!documento) {
        return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
      }

      // Authorization check
      const hasAccess = userId
        ? documento.tramite.participantes.some((p) => p.usuarioId === userId)
        : documento.tramite.invitaciones.some(
            (i) => i.token === invitacionToken && i.estado === 'PENDIENTE'
          )

      if (!hasAccess) {
        return NextResponse.json({ error: 'Sin acceso a este documento' }, { status: 403 })
      }

      // Serve: legacy base64 passes through, S3 keys get presigned GET URL
      if (isLegacyPath(documento.path)) {
        return NextResponse.json({ url: documento.path })
      }

      const url = await getPresignedGetUrl(documento.path)
      return NextResponse.json({ url })
    } catch (error) {
      console.error('Error generando URL de documento:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/app/api/documentos/[id]/url/route.ts
  git commit -m "feat: add document URL endpoint with dual-mode legacy/S3 support"
  ```

---

### Task 10: Update FileUploadQuestion component

**Files:**
- Modify: `src/components/forms/questions/FileUploadQuestion.tsx`

- [ ] **Step 1: Replace the upload logic in FileUploadQuestion.tsx**

  Replace the entire file with:

  ```typescript
  'use client'

  import { useState, useRef } from 'react'
  import { Button } from '@/components/ui/button'
  import { StepComponentProps } from '../OneQuestionWizard'

  type UploadState = 'idle' | 'presigning' | 'uploading' | 'registering' | 'done' | 'error'

  interface FileUploadQuestionProps extends StepComponentProps {
    tramiteId: string
    tipoDocumento: string
    acceptedTypes?: string
    maxSizeMB?: number
    presignEndpoint?: string
    registerEndpoint?: string
    extraHeaders?: Record<string, string>
  }

  export function FileUploadQuestion({
    value,
    onChange,
    tramiteId,
    tipoDocumento,
    acceptedTypes = 'image/*,.pdf',
    maxSizeMB = 20,
    presignEndpoint = '/api/documentos/presign',
    registerEndpoint = '/api/documentos',
    extraHeaders = {},
  }: FileUploadQuestionProps) {
    const [uploadState, setUploadState] = useState<UploadState>('idle')
    const [preview, setPreview] = useState<string | null>(value?.path || null)
    const [error, setError] = useState<string>()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const getAuthHeaders = (): Record<string, string> => {
      const stored = localStorage.getItem('auth-storage')
      const token = stored ? JSON.parse(stored).state?.token : null
      const headers: Record<string, string> = { ...extraHeaders }
      if (token && presignEndpoint === '/api/documentos/presign') {
        headers['Authorization'] = `Bearer ${token}`
      }
      return headers
    }

    const uploadFile = async (file: File, attempt = 1): Promise<void> => {
      // Step 1: Get presigned PUT URL
      setUploadState('presigning')
      const authHeaders = getAuthHeaders()

      const presignRes = await fetch(presignEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          tramiteId,
          tipo: tipoDocumento,
          mimeType: file.type,
          size: file.size,
          nombreArchivo: file.name,
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Error al preparar la subida')
      }

      const { uploadUrl, key } = await presignRes.json()

      // Step 2: PUT file directly to S3
      setUploadState('uploading')
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!s3Res.ok) {
        if (s3Res.status === 403 && attempt === 1) {
          // URL expired — retry presign once
          return uploadFile(file, 2)
        }
        throw new Error(`Error al subir archivo (${s3Res.status})`)
      }

      // Step 3: Register in DB
      setUploadState('registering')
      const registerRes = await fetch(registerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          key,
          tramiteId,
          tipo: tipoDocumento,
          mimeType: file.type,
          size: file.size,
          nombreArchivo: file.name,
        }),
      })

      if (!registerRes.ok) {
        const err = await registerRes.json()
        throw new Error(err.error || 'Error al registrar documento')
      }

      const { documento } = await registerRes.json()
      onChange(documento)
      setUploadState('done')
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setError(undefined)

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
        return
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreview('pdf')
      }

      try {
        await uploadFile(file)
      } catch (err: any) {
        setError(err.message || 'Error al subir archivo')
        setPreview(null)
        setUploadState('error')
      }
    }

    const handleRemove = () => {
      setPreview(null)
      setUploadState('idle')
      setError(undefined)
      onChange(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const isLoading = ['presigning', 'uploading', 'registering'].includes(uploadState)

    const uploadStateLabel: Record<string, string> = {
      presigning: 'Preparando...',
      uploading: 'Subiendo archivo...',
      registering: 'Guardando...',
    }

    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes}
          className="hidden"
          required={false}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!preview ? (
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">Click para subir</span>{' '}o arrastra aquí
              </div>
              <p className="text-xs text-gray-500">Imágenes (JPG, PNG) o PDF hasta {maxSizeMB}MB</p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            {preview !== 'pdf' ? (
              <img src={preview} alt="Preview" className="max-w-full h-auto rounded" />
            ) : (
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Documento PDF subido correctamente</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="flex-1">
                Cambiar archivo
              </Button>
              <Button type="button" variant="destructive" onClick={handleRemove} disabled={isLoading}>
                Eliminar
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-gray-600">
            {uploadStateLabel[uploadState] ?? 'Procesando...'}
          </div>
        )}
      </div>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/components/forms/questions/FileUploadQuestion.tsx
  git commit -m "feat: update FileUploadQuestion to use S3 presigned PUT flow"
  ```

---

### Task 11: Update HijosFormQuestion component

**Files:**
- Modify: `src/components/forms/questions/HijosFormQuestion.tsx`

- [ ] **Step 1: Replace the handleFileUpload function**

  Find and replace the `handleFileUpload` async function (lines ~85-125) with:

  ```typescript
  const handleFileUpload = async (index: number, file: File) => {
    setIsUploading({ ...isUploading, [index]: true })
    setUploadError({ ...uploadError, [index]: '' })

    try {
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token
        : null

      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const tipo = `ACTA_NACIMIENTO_HIJO_${index + 1}`

      // Step 1: Presign
      const presignRes = await fetch('/api/documentos/presign', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          tramiteId,
          tipo,
          mimeType: file.type,
          size: file.size,
          nombreArchivo: file.name,
        }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Error al preparar la subida')
      }
      const { uploadUrl, key } = await presignRes.json()

      // Step 2: PUT to S3
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!s3Res.ok) {
        throw new Error(`Error al subir archivo (${s3Res.status})`)
      }

      // Step 3: Register
      const registerRes = await fetch('/api/documentos', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          key,
          tramiteId,
          tipo,
          mimeType: file.type,
          size: file.size,
          nombreArchivo: file.name,
        }),
      })
      if (!registerRes.ok) {
        const err = await registerRes.json()
        throw new Error(err.error || 'Error al registrar documento')
      }

      const data = await registerRes.json()
      const nuevosHijos = [...hijos]
      nuevosHijos[index] = { ...nuevosHijos[index], actaNacimiento: data.documento }
      setHijos(nuevosHijos)
      onChange(nuevosHijos)
    } catch (err: any) {
      setUploadError({ ...uploadError, [index]: err.message })
    } finally {
      setIsUploading({ ...isUploading, [index]: false })
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/components/forms/questions/HijosFormQuestion.tsx
  git commit -m "feat: update HijosFormQuestion to use S3 presigned PUT flow"
  ```

---

### Task 12: Create base64 → S3 migration script

**Files:**
- Create: `scripts/migrate-docs-to-s3.ts`

- [ ] **Step 1: Create scripts/migrate-docs-to-s3.ts**

  ```typescript
  /**
   * One-time migration: moves base64 documents from DB to S3.
   * Idempotent: skips rows where path does NOT start with 'data:'.
   *
   * Usage:
   *   npx ts-node scripts/migrate-docs-to-s3.ts [--dry-run] [--limit N]
   */

  import { PrismaClient } from '@prisma/client'
  import { PrismaPg } from '@prisma/adapter-pg'
  import { Pool } from 'pg'
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
  import 'dotenv/config'

  const isDryRun = process.argv.includes('--dry-run')
  const limitArg = process.argv.indexOf('--limit')
  const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : undefined

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'application/pdf': '.pdf',
  }

  async function main() {
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}${limit ? ` | Limit: ${limit}` : ''}`)

    const documentos = await prisma.documento.findMany({
      where: { path: { startsWith: 'data:' } },
      take: limit,
    })

    console.log(`Found ${documentos.length} documents to migrate`)

    let migrated = 0
    let failed = 0

    for (const doc of documentos) {
      try {
        // Parse data URI: data:{mimeType};base64,{data}
        const match = doc.path.match(/^data:([^;]+);base64,(.+)$/)
        if (!match) {
          console.error(`  ✗ ${doc.id}: unrecognized path format`)
          failed++
          continue
        }

        const [, mimeType, b64] = match
        const buffer = Buffer.from(b64, 'base64')
        const ext = MIME_TO_EXT[mimeType] ?? '.bin'
        const key = `tramites/${doc.tramiteId}/${doc.tipo}_${doc.id}${ext}`

        if (isDryRun) {
          console.log(`  [dry] ${doc.id} → ${key} (${buffer.length} bytes)`)
          migrated++
          continue
        }

        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }))

        await prisma.documento.update({
          where: { id: doc.id },
          data: { path: key },
        })

        console.log(`  ✓ ${doc.id} → ${key}`)
        migrated++
      } catch (err: any) {
        console.error(`  ✗ ${doc.id}: ${err.message}`)
        failed++
      }
    }

    console.log(`\nDone. Migrated: ${migrated} | Failed: ${failed}`)
    await prisma.$disconnect()
    await pool.end()
  }

  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
  ```

- [ ] **Step 2: Install ts-node and dotenv if not present**

  ```bash
  npm install --save-dev ts-node dotenv
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add scripts/migrate-docs-to-s3.ts package.json package-lock.json
  git commit -m "feat: add base64-to-S3 migration script"
  ```

---

### Task 13: Deploy S3 changes and run migration

**Files:** None (deployment + data migration)

- [ ] **Step 1: Add S3 env vars to Vercel**

  In Vercel → Settings → Environment Variables, add:
  ```
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=<from IAM user created in Task 5>
  AWS_SECRET_ACCESS_KEY=<from IAM user created in Task 5>
  S3_BUCKET_NAME=portal-ciudadano-docs
  ```

- [ ] **Step 2: Deploy to production**

  ```bash
  git push origin master
  ```
  Wait for build. Verify no build errors.

- [ ] **Step 3: Smoke test file upload on production**

  - Start a new trámite
  - Reach a document upload step
  - Upload a small PDF (<1MB)
  - Verify the wizard continues (document registered)
  - Check Vercel logs — should see no errors

- [ ] **Step 4: Run migration script dry run**

  Copy the production `.env` values to a local `.env` file (or use `.env.local`), then:

  ```bash
  npx ts-node --esm scripts/migrate-docs-to-s3.ts --dry-run
  ```
  Expected: lists all documents that would be migrated.

- [ ] **Step 5: Run migration script for real**

  ```bash
  npx ts-node --esm scripts/migrate-docs-to-s3.ts
  ```
  Expected: all documents migrated with `✓` status. Zero failures.

  If failures occur: script is idempotent, fix the issue and re-run. Do not proceed until all migrated.

---

## Chunk 3: Email — SMTP → SES

### Task 14: Set up AWS SES (infrastructure — manual, can be done in parallel with Chunk 2)

**Files:** None (AWS console)

- [ ] **Step 1: Verify sending domain in SES**

  In AWS Console → SES → Verified Identities → Create Identity:
  - Type: Domain
  - Domain: `tsjchihuahua.gob.mx` (the domain in `SMTP_FROM`)
  - DKIM: enable, add the provided DNS records to the domain's DNS zone

  Wait for verification status to become "Verified" (can take minutes to hours depending on DNS TTL).

- [ ] **Step 2: Request to exit SES sandbox**

  In SES → Account Dashboard → Request production access:
  - Use case: transactional emails (invitations to divorce proceedings)
  - Expected volume: low (<1000/day)

  **This step blocks the SES deploy. Do not proceed to Task 15 until AWS approves the request (1–2 business days).**

- [ ] **Step 3: Create SES SMTP credentials**

  In SES → Account Dashboard → SMTP settings → Create SMTP credentials:
  - This creates an IAM user and generates SMTP-specific credentials (different from regular IAM keys)
  - Save the SMTP username and password

- [ ] **Step 4: Smoke test with verified address**

  Before deploying, test locally:
  Add to `.env.local`:
  ```
  SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
  SES_SMTP_USER=<smtp user>
  SES_SMTP_PASSWORD=<smtp password>
  SMTP_FROM=noreply@tsjchihuahua.gob.mx
  ```

  Run the dev server and trigger an invitation email to a verified address. Check inbox.
  Expected: email arrives within 30 seconds.

---

### Task 15: Update email.ts to use SES

**Files:**
- Modify: `src/lib/email.ts`

- [ ] **Step 1: Update the transporter configuration**

  Replace the `transporter` declaration at the top of `src/lib/email.ts` (lines 1–12):

  ```typescript
  import nodemailer from 'nodemailer';

  const transporter = nodemailer.createTransport({
    host: process.env.SES_SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SES_SMTP_USER,
      pass: process.env.SES_SMTP_PASSWORD,
    },
  });
  ```

  The rest of the file (all functions: `enviarEmail`, `enviarInvitacionEmail`, `enviarConfirmacionDatosEmail`) stays unchanged.

- [ ] **Step 2: Commit**

  ```bash
  git add src/lib/email.ts
  git commit -m "feat: migrate email transport from generic SMTP to AWS SES"
  ```

---

### Task 16: Deploy SES and cleanup

- [ ] **Step 1: Add SES env vars to Vercel**

  In Vercel → Settings → Environment Variables:
  - Add: `SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com`
  - Add: `SES_SMTP_USER=<smtp user>`
  - Add: `SES_SMTP_PASSWORD=<smtp password>`
  - Remove (or keep for fallback): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

- [ ] **Step 2: Deploy**

  ```bash
  git push origin master
  ```

- [ ] **Step 3: Smoke test email on production**

  Start a new trámite and send an invitation to cónyuge 2. Verify email arrives.

---

### Task 17: Final cleanup (after 48h of stable production)

- [ ] **Step 1: Remove Neon database**

  In Neon dashboard: delete the `portal_ciudadano` project.

- [ ] **Step 2: Remove old SMTP env vars from Vercel**

  Delete `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` from Vercel env vars.

- [ ] **Step 3: Final commit (cleanup)**

  ```bash
  git add .
  git commit -m "chore: remove legacy SMTP env var references after SES migration"
  ```
