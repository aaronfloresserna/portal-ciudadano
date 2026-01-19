# Guía de Inicio Rápido - Portal Ciudadano MVP

## ✅ Setup Completado

Ya se ha configurado:
- ✅ Proyecto Next.js 14 con TypeScript y Tailwind
- ✅ Todas las dependencias instaladas (Prisma, Auth, Forms, PDF)
- ✅ Docker Compose para PostgreSQL
- ✅ Schema de Prisma con 4 tablas (Usuario, Tramite, Documento, Expediente)
- ✅ Estructura de carpetas base
- ✅ Variables de entorno configuradas
- ✅ Archivos de utilidades (auth, db, validators, types)

## 🚀 Pasos para Iniciar

### 1. Iniciar Docker Desktop
Antes de continuar, asegúrate de que Docker Desktop esté corriendo:
- **Mac**: Abre Docker.app desde /Applications
- **Windows**: Abre Docker Desktop desde el menú inicio

### 2. Levantar la Base de Datos
```bash
docker-compose up -d
```

Verifica que PostgreSQL está corriendo:
```bash
docker ps
```

Deberías ver un contenedor llamado `portal-ciudadano-db`

### 3. Generar Cliente de Prisma
```bash
npx prisma generate
```

### 4. Crear las Tablas en la Base de Datos
```bash
npx prisma migrate dev --name init
```

Esto creará las tablas:
- `usuarios` - Usuarios registrados
- `tramites` - Trámites de divorcio
- `documentos` - Documentos subidos
- `expedientes` - PDFs generados

### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

## 🔍 Verificar que Todo Funciona

### Opción 1: Interfaz Visual de Prisma
```bash
npx prisma studio
```
Esto abrirá una interfaz web en http://localhost:5555 donde puedes ver las tablas vacías.

### Opción 2: Ver logs de Docker
```bash
docker-compose logs -f postgres
```

## 📁 Estructura Actual

```
portal-ciudadano/
├── src/
│   ├── app/                    # Next.js (aún sin páginas custom)
│   ├── components/             # Componentes (vacío, los crearemos)
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── tramites/
│   ├── lib/
│   │   ├── db.ts              ✅ Cliente Prisma
│   │   ├── auth.ts            ✅ Funciones JWT y bcrypt
│   │   └── validators.ts      ✅ Schemas Zod
│   └── types/
│       └── tramite.ts         ✅ TypeScript types
├── prisma/
│   └── schema.prisma          ✅ Schema con 4 modelos
├── docker-compose.yml         ✅ PostgreSQL config
├── .env                       ✅ Variables de entorno
└── README.md                  ✅ Documentación
```

## 🎯 Próximos Pasos (Semana 1)

Ahora que el setup está completo, continuaremos con:

### Día 1-2: API de Autenticación
- [ ] Crear `/api/auth/register` - Registro de usuarios
- [ ] Crear `/api/auth/login` - Login con JWT
- [ ] Crear `/api/auth/me` - Obtener usuario actual
- [ ] Crear middleware de autenticación

### Día 3-4: Páginas de Autenticación
- [ ] Página `/login` - Formulario de login
- [ ] Página `/registro` - Formulario de registro
- [ ] Layout base con header y footer

### Día 5: API de Trámites
- [ ] Crear `/api/tramites` - CRUD de trámites
- [ ] Crear `/api/tramites/[id]` - Operaciones específicas

## 📝 Comandos Útiles

```bash
# Ver estado de la base de datos
npx prisma studio

# Ver logs de Docker
docker-compose logs -f

# Reiniciar PostgreSQL
docker-compose restart postgres

# Detener todo
docker-compose down

# Limpiar y empezar de nuevo (¡cuidado! borra datos)
docker-compose down -v
docker-compose up -d
npx prisma migrate reset
```

## ⚠️ Solución de Problemas

### "Docker daemon is not running"
```bash
# Inicia Docker Desktop manualmente
```

### "Port 5432 is already in use"
```bash
# Ver qué está usando el puerto
lsof -i :5432

# O cambia el puerto en docker-compose.yml:
# ports:
#   - "5433:5432"
# Y actualiza .env:
# DATABASE_URL="postgresql://portal:portal123@localhost:5433/..."
```

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Errores de TypeScript
```bash
# Instala los types faltantes
npm install -D @types/node @types/react @types/react-dom
```

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de React Hook Form](https://react-hook-form.com/)
- [Documentación de Zod](https://zod.dev/)

---

**Estado**: Setup Completado ✅
**Siguiente Fase**: Implementar Autenticación (API + UI)
