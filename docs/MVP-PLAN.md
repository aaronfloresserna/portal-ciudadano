# MVP - Portal Ciudadano (Divorcio Voluntario)

## Timeline: 3-4 semanas

---

## Estructura del Proyecto Simplificada

```
portal-ciudadano/
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── registro/page.tsx
│   │   ├── (portal)/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── tramites/
│   │   │       └── divorcio/
│   │   │           ├── [id]/page.tsx
│   │   │           └── nuevo/page.tsx
│   │   ├── api/                    # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── tramites/
│   │   │   │   ├── route.ts        # GET, POST
│   │   │   │   └── [id]/route.ts   # GET, PATCH, DELETE
│   │   │   ├── documentos/
│   │   │   │   └── upload/route.ts
│   │   │   └── expedientes/
│   │   │       └── [id]/generate/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── forms/
│   │   │   ├── StepWizard.tsx
│   │   │   ├── ConyugeForm.tsx
│   │   │   ├── MatrimonioForm.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   └── SignaturePad.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── tramites/
│   │       └── TramiteCard.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                   # Prisma client
│   │   ├── auth.ts                 # JWT utils
│   │   ├── validators.ts           # Zod schemas
│   │   └── pdf-generator.ts        # PDF generation
│   │
│   ├── types/
│   │   ├── tramite.ts
│   │   └── usuario.ts
│   │
│   └── middleware.ts               # Auth middleware
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/
│
├── public/
│   └── uploads/                    # Temporary file storage
│
├── docker-compose.yml              # PostgreSQL local
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Semana 1: Setup + Autenticación + Base de Datos

### Día 1-2: Setup del proyecto

```bash
# Inicializar proyecto
npx create-next-app@latest portal-ciudadano --typescript --tailwind --app --no-src

# Instalar dependencias
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install zod react-hook-form @hookform/resolvers
npm install zustand
npm install pdf-lib
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D @types/bcrypt @types/jsonwebtoken
```

### Día 2-3: Base de datos con Prisma

**prisma/schema.prisma**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  nombre    String
  telefono  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tramites  Tramite[]
}

model Tramite {
  id          String   @id @default(cuid())
  usuarioId   String
  tipo        String   @default("DIVORCIO_VOLUNTARIO")
  estado      String   @default("BORRADOR") // BORRADOR, COMPLETADO
  pasoActual  Int      @default(1)
  datos       Json     // Almacenar todos los datos del formulario
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  usuario     Usuario     @relation(fields: [usuarioId], references: [id])
  documentos  Documento[]
  expediente  Expediente?
}

model Documento {
  id          String   @id @default(cuid())
  tramiteId   String
  tipo        String   // INE_CONYUGE_1, INE_CONYUGE_2, ACTA_MATRIMONIO, CONVENIO
  nombreArchivo String
  path        String
  mimeType    String
  size        Int
  createdAt   DateTime @default(now())

  tramite     Tramite  @relation(fields: [tramiteId], references: [id])
}

model Expediente {
  id          String    @id @default(cuid())
  tramiteId   String    @unique
  pdfPath     String
  hashSha256  String
  generatedAt DateTime  @default(now())

  tramite     Tramite   @relation(fields: [tramiteId], references: [id])
}
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: portal-db
    environment:
      POSTGRES_USER: portal
      POSTGRES_PASSWORD: portal123
      POSTGRES_DB: portal_ciudadano
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Comandos**:
```bash
# Iniciar PostgreSQL
docker-compose up -d

# Crear migración
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate
```

### Día 4-5: Autenticación

**src/lib/auth.ts**:
```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'secret-local-mvp'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
```

**src/app/api/auth/register/route.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
  telefono: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, nombre, telefono } = registerSchema.parse(body)

    // Verificar si existe
    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email ya registrado' },
        { status: 400 }
      )
    }

    // Crear usuario
    const hashedPassword = await hashPassword(password)
    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        telefono
      }
    })

    const token = generateToken(usuario.id)

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar' },
      { status: 500 }
    )
  }
}
```

**src/app/api/auth/login/route.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, usuario.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const token = generateToken(usuario.id)

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
```

**src/middleware.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (pathname.startsWith('/login') || pathname.startsWith('/registro')) {
    return NextResponse.next()
  }

  // Rutas protegidas
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tramites')) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tramites/:path*', '/login', '/registro']
}
```

---

## Semana 2: Formulario de Divorcio (Steps 1-3)

### Estructura de datos del trámite

**src/types/tramite.ts**:
```typescript
export interface DivorcioData {
  // Paso 1: Cónyuge 1
  conyuge1: {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    curp: string
    fechaNacimiento: string
    lugarNacimiento: string
  }
  // Paso 2: Cónyuge 2
  conyuge2: {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
    curp: string
    fechaNacimiento: string
    lugarNacimiento: string
  }
  // Paso 3: Matrimonio
  matrimonio: {
    fechaCelebracion: string
    lugarCelebracion: string
    regimenPatrimonial: 'SEPARACION_BIENES' | 'SOCIEDAD_CONYUGAL'
    tieneHijos: boolean
    numeroHijos?: number
  }
  // Paso 5: Firma
  firma?: string // base64 de la firma
}
```

### Componente StepWizard

**src/components/forms/StepWizard.tsx**:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface StepWizardProps {
  steps: {
    title: string
    component: React.ComponentType<any>
  }[]
  onComplete: (data: any) => void
}

export function StepWizard({ steps, onComplete }: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})

  const handleNext = (stepData: any) => {
    const newData = { ...formData, ...stepData }
    setFormData(newData)

    if (currentStep === steps.length - 1) {
      onComplete(newData)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 text-center ${
                index === currentStep ? 'font-bold' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <p className="text-xs">{step.title}</p>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Current step */}
      <CurrentStepComponent
        data={formData}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentStep > 0}
      />
    </div>
  )
}
```

### Formularios de cada paso

**src/components/forms/ConyugeForm.tsx**:
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const conyugeSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  apellidoPaterno: z.string().min(2, 'Apellido paterno requerido'),
  apellidoMaterno: z.string().min(2, 'Apellido materno requerido'),
  curp: z.string().length(18, 'CURP debe tener 18 caracteres'),
  fechaNacimiento: z.string(),
  lugarNacimiento: z.string().min(2, 'Lugar de nacimiento requerido')
})

export function ConyugeForm({ numero, data, onNext, onBack, canGoBack }: any) {
  const key = `conyuge${numero}`
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(conyugeSchema),
    defaultValues: data[key] || {}
  })

  const onSubmit = (formData: any) => {
    onNext({ [key]: formData })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">
        Datos del Cónyuge {numero}
      </h2>

      <div>
        <Label htmlFor="nombre">Nombre(s)</Label>
        <Input id="nombre" {...register('nombre')} />
        {errors.nombre && (
          <p className="text-red-500 text-sm">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
        <Input id="apellidoPaterno" {...register('apellidoPaterno')} />
        {errors.apellidoPaterno && (
          <p className="text-red-500 text-sm">{errors.apellidoPaterno.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
        <Input id="apellidoMaterno" {...register('apellidoMaterno')} />
        {errors.apellidoMaterno && (
          <p className="text-red-500 text-sm">{errors.apellidoMaterno.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="curp">CURP</Label>
        <Input
          id="curp"
          {...register('curp')}
          maxLength={18}
          placeholder="AAAA000000HDFXXX00"
        />
        {errors.curp && (
          <p className="text-red-500 text-sm">{errors.curp.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
        <Input
          id="fechaNacimiento"
          type="date"
          {...register('fechaNacimiento')}
        />
        {errors.fechaNacimiento && (
          <p className="text-red-500 text-sm">{errors.fechaNacimiento.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
        <Input
          id="lugarNacimiento"
          {...register('lugarNacimiento')}
          placeholder="Ciudad, Estado"
        />
        {errors.lugarNacimiento && (
          <p className="text-red-500 text-sm">{errors.lugarNacimiento.message}</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        {canGoBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
        )}
        <Button type="submit" className="ml-auto">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
```

---

## Semana 3: Documentos + Firma + Generación PDF

### DocumentUploader component
### SignaturePad component
### API de generación de PDF
### Descargar expediente

---

## Semana 4: Dashboard + Pulido + Testing

### Dashboard con listado de trámites
### Mejoras de UX
### Testing básico
### Documentación

---

## Variables de Entorno (.env.local)

```bash
DATABASE_URL="postgresql://portal:portal123@localhost:5432/portal_ciudadano"
JWT_SECRET="tu-secret-super-secreto-local-mvp"
UPLOAD_DIR="./public/uploads"
```

---

## Comandos para Iniciar

```bash
# Instalar dependencias
npm install

# Iniciar base de datos
docker-compose up -d

# Migrar base de datos
npx prisma migrate dev

# Iniciar desarrollo
npm run dev
```

Acceder a: http://localhost:3000

---

## Próximos pasos después del MVP

1. Agregar OCR (Google Vision API o Tesseract)
2. Agregar video-consentimiento
3. Agregar más tipos de trámites
4. Implementar integración con buzón estatal
5. Desplegar en servidor productivo
6. Agregar sistema de notificaciones
