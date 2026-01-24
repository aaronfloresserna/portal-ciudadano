# Portal Ciudadano - Sistema de Trámites de Divorcio Voluntario

Sistema web para gestionar trámites de divorcio voluntario del Tribunal Superior de Justicia del Estado de Chihuahua.

## 🚀 Características Principales

### Sistema Dual de Usuarios
- **Cónyuge 1 (Solicitante)**: Inicia el trámite y completa sus datos personales
- **Cónyuge 2**: Recibe invitación por email y completa sus datos
- **Colaboración**: Ambos completan juntos los datos del matrimonio, hijos y firman el convenio

### Notificaciones en Tiempo Real
- Sistema de notificaciones en el portal
- Campanilla con contador de notificaciones no leídas
- Polling automático cada 30 segundos
- Notificaciones por email

### Gestión de Trámites
- Formulario wizard paso a paso
- Validación de datos en cada paso
- Guardado automático del progreso
- Carga de documentos (INE, acta de matrimonio)
- Firma digital con evidencia fotográfica
- Generación de convenio en PDF

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL (Vercel Postgres)
- **Autenticación**: JWT con bcrypt
- **Email**: Nodemailer
- **PDF**: @react-pdf/renderer, pdf-lib
- **Estado**: Zustand
- **Validación**: Zod, React Hook Form

## 📋 Requisitos Previos

- Node.js 20+
- PostgreSQL (o Vercel Postgres)
- Cuenta de email SMTP (Gmail o SendGrid)

## 🏃‍♂️ Inicio Rápido (Local)

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd portal-ciudadano
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con tus credenciales
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Generar cliente Prisma
npx prisma generate

# (Opcional) Ver base de datos
npx prisma studio
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment en Vercel

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

### Pasos Rápidos:

1. **Crear base de datos en Vercel**
   - Ve a vercel.com → Storage → Create Database → Postgres

2. **Importar proyecto**
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar variables de entorno** (ver DEPLOYMENT.md)
   - `DATABASE_URL` (auto-generado)
   - `JWT_SECRET`
   - `SMTP_*` (configuración de email)
   - `NEXT_PUBLIC_APP_URL`

4. **Deploy**
   - Vercel ejecutará automáticamente las migraciones
   - Tu app estará disponible en `https://tu-proyecto.vercel.app`

## 📁 Estructura del Proyecto

```
portal-ciudadano/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Páginas de autenticación
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── invitacion/      # Aceptar invitaciones
│   │   ├── (portal)/            # Páginas del portal
│   │   │   ├── dashboard/
│   │   │   └── tramites/
│   │   │       └── divorcio/
│   │   │           ├── nuevo/
│   │   │           └── [id]/
│   │   │               ├── page.tsx          # Formulario wizard
│   │   │               ├── invitar/          # Enviar invitación
│   │   │               └── confirmacion/
│   │   └── api/                 # API Routes
│   │       ├── auth/
│   │       ├── tramites/
│   │       ├── invitaciones/    # Endpoints de invitaciones
│   │       ├── notificaciones/  # Endpoints de notificaciones
│   │       └── documentos/
│   ├── components/
│   │   ├── forms/               # Componentes del formulario wizard
│   │   │   ├── OneQuestionWizard.tsx
│   │   │   └── questions/       # Tipos de preguntas
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── NotificationBell.tsx  # Campanilla de notificaciones
│   ├── lib/
│   │   ├── db.ts                # Cliente Prisma
│   │   ├── auth.ts              # JWT helpers
│   │   ├── email.ts             # Envío de emails
│   │   ├── notificaciones.ts   # Helpers de notificaciones
│   │   └── validators.ts
│   └── stores/
│       ├── authStore.ts
│       └── notificacionesStore.ts  # Zustand store para notificaciones
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── migrations/              # Migraciones
├── public/
│   └── uploads/                 # Archivos subidos
└── package.json
```

## 🗄️ Modelo de Datos

### Principales Entidades

- **Usuario**: Usuarios del sistema (ambos cónyuges)
- **Tramite**: Trámites de divorcio
- **TramiteParticipante**: Relación Usuario-Tramite con rol (SOLICITANTE/CONYUGE)
- **Invitacion**: Invitaciones de Cónyuge 1 a Cónyuge 2
- **Notificacion**: Notificaciones en el sistema
- **Documento**: Archivos subidos (INE, acta matrimonio)
- **Expediente**: PDF generado del convenio

### Estados del Trámite

- `BORRADOR`: Cónyuge 1 completando datos
- `ESPERANDO_CONYUGE_2`: Esperando que Cónyuge 2 acepte
- `EN_PROGRESO`: Ambos completando datos compartidos
- `COMPLETADO`: Trámite finalizado

## 🔐 Flujo de Autenticación y Permisos

1. **Registro/Login**: JWT almacenado en Zustand (localStorage)
2. **Autorización**: Middleware verifica token en cada request
3. **Permisos**: Solo participantes pueden ver/editar un trámite
4. **Validación por Rol**: 
   - SOLICITANTE solo edita `conyuge1_*` en BORRADOR
   - CONYUGE solo edita `conyuge2_*` en ESPERANDO_CONYUGE_2
   - Ambos editan datos compartidos en EN_PROGRESO

## 📧 Sistema de Notificaciones

### Tipos de Notificaciones

- `INVITACION`: Nueva invitación recibida
- `PROGRESO`: Cambios en el trámite
- `COMPLETADO`: Trámite finalizado
- `SISTEMA`: Mensajes del sistema

### Eventos que Generan Notificaciones

1. Invitación enviada → Email al Cónyuge 2
2. Invitación aceptada → Notificación al Cónyuge 1
3. Datos completados → Notificación al otro cónyuge
4. Trámite completado → Notificación a ambos

## 🧪 Testing

### Probar el Flujo Completo

1. **Registrar Cónyuge 1**
   - Email: `conyuge1@test.com`
   - Crear trámite
   - Completar datos personales (nombre, CURP, INE)

2. **Enviar Invitación**
   - Ingresar email de Cónyuge 2
   - Verificar email recibido

3. **Aceptar como Cónyuge 2**
   - Registrar con email: `conyuge2@test.com`
   - Aceptar invitación
   - Completar datos personales

4. **Completar Trámite**
   - Login con cualquiera de los dos
   - Completar datos del matrimonio
   - Agregar información de hijos (si aplica)
   - Firmar convenio
   - Generar PDF

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build para producción (incluye migraciones)
npm run start        # Ejecutar build de producción
npm run lint         # Ejecutar ESLint
npm run db:migrate   # Ejecutar migraciones
npm run db:push      # Push schema sin migración
npm run db:studio    # Abrir Prisma Studio
```

## 🐛 Troubleshooting

### La migración falla
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Los emails no se envían
- Verifica credenciales SMTP en `.env`
- Si usas Gmail, usa "Contraseña de aplicación"
- Revisa logs del servidor

### Error de conexión a base de datos
- Verifica que PostgreSQL esté corriendo
- Verifica `DATABASE_URL` en `.env`
- Verifica permisos de usuario de DB

## 📝 Licencia

Proyecto desarrollado para el Tribunal Superior de Justicia del Estado de Chihuahua.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para preguntas o soporte, contacta al equipo de desarrollo del TSJ Chihuahua.
