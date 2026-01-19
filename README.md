# Portal Ciudadano - MVP

Sistema de trámites administrativos digitales para la ciudad de Chihuahua.

## MVP: Trámite de Divorcio Voluntario

Este MVP incluye únicamente el flujo completo del trámite de **Divorcio Voluntario** con las siguientes funcionalidades:

- ✅ Registro y autenticación de usuarios
- ✅ Formulario guiado en 5 pasos
- ✅ Carga de documentos (INE, acta matrimonio, convenio)
- ✅ Firma manuscrita digital
- ✅ Generación de expediente en PDF
- ✅ Dashboard para ver mis trámites

## Stack Tecnológico

- **Frontend + Backend**: Next.js 14 (App Router + API Routes)
- **Base de Datos**: PostgreSQL 15
- **ORM**: Prisma
- **Autenticación**: JWT + bcrypt
- **Formularios**: React Hook Form + Zod
- **PDF**: pdf-lib
- **UI**: Tailwind CSS + shadcn/ui

## Requisitos Previos

- Node.js 18+
- Docker Desktop (para PostgreSQL)
- npm o yarn

## Instalación

1. **Clonar el repositorio** (o ya estás en el directorio)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar PostgreSQL con Docker**:
```bash
docker-compose up -d
```

Verifica que el contenedor esté corriendo:
```bash
docker ps
```

5. **Crear la base de datos con Prisma**:
```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma migrate dev --name init
```

6. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
portal-ciudadano/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── (portal)/          # Rutas protegidas
│   │   └── api/               # API Routes (backend)
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base
│   │   ├── forms/            # Formularios
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilidades
│   │   ├── db.ts            # Cliente Prisma
│   │   ├── auth.ts          # Funciones de autenticación
│   │   └── validators.ts    # Schemas Zod
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Schema de base de datos
├── public/
│   └── uploads/              # Archivos subidos
└── docs/                     # Documentación del proyecto
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build para producción
npm start                # Iniciar servidor de producción

# Base de datos
npx prisma studio        # Abrir interfaz visual de la BD
npx prisma migrate dev   # Crear nueva migración
npx prisma generate      # Regenerar cliente de Prisma

# Docker
docker-compose up -d     # Iniciar PostgreSQL
docker-compose down      # Detener PostgreSQL
docker-compose logs      # Ver logs
```

## Flujo del Trámite de Divorcio

1. **Paso 1**: Datos del Cónyuge 1
2. **Paso 2**: Datos del Cónyuge 2
3. **Paso 3**: Datos del Matrimonio
4. **Paso 4**: Subir Documentos (INE ambos, acta matrimonio, convenio)
5. **Paso 5**: Revisión y Firma

Al finalizar, se genera un expediente en PDF descargable.

## Próximos Pasos (Post-MVP)

- [ ] OCR para extracción automática de datos de documentos
- [ ] Video-consentimiento
- [ ] Más tipos de trámites (rectificaciones, sucesiones, etc.)
- [ ] Integración con buzón estatal
- [ ] Sistema de notificaciones por email
- [ ] Despliegue en servidor productivo

## Problemas Comunes

### Docker no está corriendo
```bash
# Iniciar Docker Desktop manualmente
# En Mac: Abrir Docker.app desde /Applications
# En Windows: Abrir Docker Desktop desde el menú inicio
```

### Puerto 5432 ya está en uso
```bash
# Ver qué proceso está usando el puerto
lsof -i :5432
# Detener el proceso o cambiar el puerto en docker-compose.yml
```

### Error de conexión a PostgreSQL
```bash
# Verificar que el contenedor está corriendo
docker ps

# Ver logs del contenedor
docker-compose logs postgres

# Reiniciar el contenedor
docker-compose restart postgres
```

## Documentación Adicional

- [Plan Completo del Proyecto](./docs/claude.md)
- [Plan del MVP](./docs/MVP-PLAN.md)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

## Licencia

Proyecto propietario - Portal Ciudadano de Chihuahua

---

**Versión**: 1.0.0 (MVP)
**Última actualización**: Enero 2026
