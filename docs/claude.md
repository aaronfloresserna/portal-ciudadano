# Plan de Implementación - Portal Ciudadano de Chihuahua

## Resumen Ejecutivo

Este documento contiene el plan detallado para la implementación del Portal Ciudadano de trámites administrativos digitales sin litis para la ciudad de Chihuahua. El proyecto está diseñado para permitir a los ciudadanos integrar, validar y firmar expedientes administrativos digitales de manera estructurada y verificable.

---

## 1. Stack Tecnológico Recomendado

### Frontend (Portal Ciudadano Web)
- **Framework**: Next.js 14+ (React con App Router)
- **Lenguaje**: TypeScript
- **UI/Styling**:
  - Tailwind CSS para estilos
  - shadcn/ui o Material-UI para componentes base
  - React Hook Form para formularios
  - Zod para validación de esquemas
- **Estado Global**: Zustand o React Context API
- **Manejo de Archivos**: react-dropzone para carga de documentos
- **Firma Digital**: @peculiar/webcrypto o librerías de firma FIEL/e.firma
- **Video**: MediaRecorder API para video-consentimiento

### Backend (API/Servicios de Trámites)
- **Framework**: NestJS (Node.js con TypeScript)
- **API**: RESTful + GraphQL (opcional)
- **Autenticación**:
  - Passport.js con JWT
  - OAuth2 para integración con e.firma/FIEL
- **Validación**: class-validator + class-transformer

### Base de Datos
- **Principal**: PostgreSQL 15+
- **Documentos/Archivos**: MinIO (S3-compatible) o AWS S3
- **Caché**: Redis
- **Motor de Búsqueda**: Elasticsearch (opcional)

### Servicios de Procesamiento
- **OCR**: Tesseract OCR o Google Cloud Vision API
- **Generación de PDFs**: PDFKit o pdf-lib
- **Queue**: Bull (Node.js) con Redis

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Orquestación**: Kubernetes (producción)
- **CI/CD**: GitHub Actions
- **Monitoreo**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## 2. Estructura del Proyecto

```
portal-ciudadano/
├── apps/
│   ├── frontend/                    # Portal Ciudadano Web (Next.js)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router
│   │   │   ├── components/         # Componentes React
│   │   │   ├── lib/                # Utilidades y configuración
│   │   │   ├── hooks/              # React hooks
│   │   │   ├── stores/             # Zustand stores
│   │   │   └── types/              # TypeScript types
│   │   └── public/
│   │
│   └── backend/                     # API Backend (NestJS)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── usuarios/
│       │   │   ├── tramites/
│       │   │   ├── documentos/
│       │   │   ├── expedientes/
│       │   │   ├── firma/
│       │   │   ├── auditoria/
│       │   │   └── integraciones/
│       │   ├── common/
│       │   └── database/
│       └── test/
│
├── services/
│   ├── ocr-service/                 # Servicio OCR (Python/FastAPI)
│   └── document-builder/            # Generación de Expedientes
│
├── packages/                        # Código compartido
│   ├── shared-types/
│   └── validators/
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── nginx/
│
├── docs/
│   ├── arquitectura.md
│   ├── api/
│   ├── workflows/
│   └── seguridad/
│
└── scripts/
```

---

## 3. Fases de Implementación

### FASE 0: Configuración Inicial (Semana 1)

**Objetivo**: Establecer la infraestructura base del proyecto.

**Tareas**:
1. Inicializar repositorio Git con estructura de branches
2. Configurar monorepo (Turborepo recomendado)
3. Configurar Docker Compose para desarrollo local
4. Establecer estándares de código (ESLint, Prettier, Husky)
5. Configurar CI/CD básico

**Entregables**:
- Repositorio configurado
- docker-compose.yml funcional
- Scripts de setup
- Documentación de setup en README.md

---

### FASE 1: Backend Core y Base de Datos (Semanas 2-4)

#### Sprint 1.1: Infraestructura Backend (Semana 2)

**Tareas**:
1. Inicializar proyecto NestJS
2. Configurar TypeORM con PostgreSQL
3. Implementar módulo de configuración con variables de entorno
4. Configurar estructura base (interceptores, filtros, pipes, middleware)
5. Implementar módulo de auditoría

**Esquema de auditoría**:
```sql
audit_logs (
  id,
  usuario_id,
  accion,
  entidad,
  entidad_id,
  datos_anteriores_json,
  datos_nuevos_json,
  ip_address,
  user_agent,
  created_at
)
```

#### Sprint 1.2: Autenticación y Usuarios (Semana 3)

**Esquema de base de datos**:
```sql
usuarios (
  id, email, password_hash, curp, nombre,
  apellido_paterno, apellido_materno, telefono,
  created_at, updated_at
)
roles (id, nombre, descripcion)
usuarios_roles (usuario_id, rol_id)
sesiones (
  id, usuario_id, token_hash, expires_at,
  ip_address, user_agent
)
```

**Tareas**:
1. Implementar módulo Auth (registro, login, JWT, refresh tokens)
2. Implementar módulo Usuarios (CRUD, perfil, cambio de contraseña)
3. Implementar guards y strategies (JwtAuthGuard, RolesGuard)
4. Implementar middleware de rate limiting

#### Sprint 1.3: Módulo de Trámites Base (Semana 4)

**Esquema de trámites**:
```sql
tipos_tramite (
  id, codigo, nombre, descripcion, workflow_config
)
tramites (
  id, usuario_id, tipo_tramite_id, estado,
  datos_json, created_at, updated_at
)
pasos_tramite (
  id, tipo_tramite_id, orden, nombre, tipo, config_json
)
respuestas_tramite (
  id, tramite_id, paso_id, respuesta_json, created_at
)
validaciones (
  id, paso_id, tipo_validacion, reglas_json
)
```

**Tareas**:
1. Implementar sistema de workflows
2. Implementar servicio de validaciones dinámicas
3. Implementar API REST de trámites
4. Tests unitarios de workflows

---

### FASE 2: Gestión Documental y OCR (Semanas 5-7)

#### Sprint 2.1: Módulo de Documentos (Semana 5)

**Esquema de documentos**:
```sql
documentos (
  id, tramite_id, tipo_documento, nombre_archivo,
  mime_type, size, storage_path, hash_sha256,
  encrypted, created_at
)
tipos_documento (
  id, codigo, nombre, descripcion,
  extensiones_permitidas, tamano_max
)
requisitos_documento (
  id, tipo_tramite_id, tipo_documento_id,
  obligatorio, orden
)
```

**Tareas**:
1. Configurar MinIO (S3-compatible storage)
2. Implementar servicio de almacenamiento con cifrado
3. Implementar API de documentos (upload, download, delete)
4. Implementar validaciones (tipos, tamaño, antivirus)

#### Sprint 2.2: Servicio OCR (Semanas 6-7)

**Tareas**:
1. Crear servicio OCR en Python/FastAPI con Tesseract
2. Implementar extracción de datos de documentos oficiales:
   - INE/IFE: nombre, CURP, dirección
   - Actas de nacimiento: nombre, fecha, lugar
   - CURP: validación y extracción
3. Implementar API del servicio OCR
4. Integrar con backend principal usando queue (Bull + Redis)
5. Implementar sistema de feedback y corrección manual

**Esquema de resultados OCR**:
```sql
resultados_ocr (
  id, documento_id, status, datos_extraidos_json,
  confidence_score, error_message, processed_at
)
```

---

### FASE 3: Frontend - Portal Ciudadano (Semanas 8-12)

#### Sprint 3.1: Configuración y Autenticación (Semana 8)

**Tareas**:
1. Inicializar proyecto Next.js con TypeScript y Tailwind
2. Configurar shadcn/ui y componentes base
3. Implementar autenticación frontend (login, registro, recuperación)
4. Implementar store de autenticación con Zustand
5. Implementar layout principal (header, sidebar, footer)

#### Sprint 3.2: Dashboard y Gestión de Trámites (Semana 9)

**Tareas**:
1. Implementar Dashboard con vista de trámites del usuario
2. Implementar catálogo de trámites disponibles
3. Implementar componente StepWizard para navegación multi-paso

#### Sprint 3.3: Formularios de Trámites (Semanas 10-11)

**Trámites a implementar**:

1. **Divorcio Voluntario**:
   - Paso 1: Datos de los cónyuges
   - Paso 2: Datos del matrimonio
   - Paso 3: Convenio
   - Paso 4: Documentos probatorios
   - Paso 5: Revisión y firma

2. **Rectificaciones Administrativas**:
   - Tipo de rectificación
   - Datos actuales vs. datos correctos
   - Documentos probatorios
   - Revisión y firma

3. **Sucesiones Voluntarias**:
   - Datos del finado
   - Datos de herederos
   - Inventario de bienes
   - Documentos
   - Revisión y firma

4. **Homologación de Convenios**:
   - Tipo de convenio
   - Partes involucradas
   - Carga de convenio
   - Documentos probatorios
   - Revisión y firma

**Componentes compartidos**:
- DocumentUploader (drag & drop, preview, validación)
- FormField wrapper
- DatePicker
- CURPInput (con validación)
- AddressForm
- FilePreview
- ValidationSummary

#### Sprint 3.4: Firma Electrónica y Video-Consentimiento (Semana 12)

**Tareas**:
1. Implementar componente SignaturePad (canvas para firma manuscrita)
2. Implementar VideoConsent (grabación con MediaRecorder API)
3. Implementar página de revisión final
4. Implementar flujo de firma y envío
5. Página de confirmación con folio

---

### FASE 4: Generación de Expedientes (Semanas 13-14)

#### Sprint 4.1: Document Builder Service (Semana 13)

**Tareas**:
1. Crear servicio de generación de PDFs (Node.js/TypeScript)
2. Crear plantillas por tipo de trámite usando Handlebars
3. Implementar generador base abstracto
4. Implementar generadores específicos para cada tipo de trámite

**Estructura del expediente**:
- Carátula
- Datos del trámite
- Datos de las partes
- Documentos anexos (índice)
- Firmas y consentimiento

#### Sprint 4.2: Integración y Seguridad (Semana 14)

**Esquema de expedientes**:
```sql
expedientes (
  id, tramite_id, pdf_path, hash_sha256,
  generated_at, buzon_enviado_at, buzon_folio
)
```

**Tareas**:
1. Integrar servicio con backend usando queue
2. Implementar hash SHA-256 de expedientes
3. Implementar watermarking en PDFs
4. Implementar firmas digitales en PDF
5. Implementar compresión y optimización

---

### FASE 5: Integración con Buzón Estatal (Semanas 15-16)

#### Sprint 5.1: Cliente Buzón Estatal (Semana 15)

**Esquema de envíos**:
```sql
envios_buzon (
  id, expediente_id, folio_buzon, status,
  request_json, response_json, intentos,
  ultimo_intento_at, enviado_at
)
```

**Tareas**:
1. Documentar especificaciones del Buzón Estatal (SOAP/REST)
2. Implementar cliente del Buzón (autenticar, enviar, consultar estatus)
3. Implementar DTOs de comunicación
4. Implementar manejo de errores con reintentos exponenciales
5. Circuit breaker pattern

#### Sprint 5.2: Queue de Envíos y Notificaciones (Semana 16)

**Tareas**:
1. Implementar queue de envíos al buzón
2. Implementar sistema de notificaciones por email
3. Implementar página de seguimiento en frontend
4. Implementar webhook para actualizaciones del buzón (si aplica)

---

### FASE 6: Testing, Seguridad y Optimización (Semanas 17-18)

#### Sprint 6.1: Testing Completo (Semana 17)

**Tareas**:
1. Tests unitarios backend (>80% cobertura)
2. Tests de integración backend
3. Tests E2E con Cypress o Playwright
4. Tests de carga con Artillery o k6 (simular 100 usuarios concurrentes)

#### Sprint 6.2: Seguridad y Compliance (Semana 18)

**Tareas**:
1. Auditoría de seguridad (npm audit, Snyk)
2. Implementar cifrado completo (TLS 1.3 + AES-256)
3. Implementar RBAC completo con roles y permisos
4. Implementar compliance NOM-151 (opcional)
5. Penetration testing (OWASP Top 10)

---

### FASE 7: Despliegue y Puesta en Producción (Semanas 19-20)

#### Sprint 7.1: Preparación de Infraestructura (Semana 19)

**Tareas**:
1. Configurar ambiente de producción (Kubernetes o VMs)
2. Configurar PostgreSQL con replicación y backups
3. Configurar storage productivo (MinIO cluster o S3)
4. Configurar monitoreo (Prometheus + Grafana)
5. Configurar logging centralizado (ELK Stack)

#### Sprint 7.2: Despliegue y Validación (Semana 20)

**Tareas**:
1. Deployment inicial con blue-green deployment
2. Migración de datos (si aplica)
3. Pruebas con usuarios beta
4. Optimizaciones finales (CDN, caché, índices)
5. Documentación final (manual de usuario, runbooks)

---

## 4. Dependencias Críticas

### Dependencias Externas
1. **Especificaciones del Buzón Estatal** - Crítico para Fase 5
2. **Certificados FIEL** - Para firma electrónica avanzada
3. **Infraestructura de producción** - Para Fase 7

### Dependencias Técnicas
1. OCR Service → Document Module
2. Auth Module → Todos los módulos
3. Trámites Module → Expedientes Module
4. Expedientes Module → Buzón Integration

### Dependencias de Conocimiento
1. Requisitos legales específicos por tipo de trámite
2. Workflows aprobados por autoridad competente

---

## 5. Consideraciones Técnicas

### Rendimiento
- Índices en columnas frecuentemente consultadas
- Redis para caché (sesiones, catálogos, validaciones)
- CDN para assets estáticos
- Lazy loading en frontend

### Escalabilidad
- Arquitectura horizontal stateless
- Read replicas para PostgreSQL
- Connection pooling
- Particionamiento de tablas grandes

### Seguridad (Defense in Depth)
- **Capa de Red**: Firewall, DDoS protection, VPC
- **Capa de Aplicación**: Input validation, CSRF, rate limiting, CORS
- **Capa de Datos**: Cifrado, menor privilegio, backups cifrados

### Mantenibilidad
- Código limpio (SOLID, DRY)
- OpenAPI/Swagger para API
- Logging estructurado (JSON)
- Tracing distribuido
- Health checks

### Compliance y Auditoría
- Audit logs inmutables
- Retención de datos (7 años)
- GDPR/LFPDPPP compliance
- Privacy by design

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Integración con Buzón Estatal | Media | Alto | Mock del buzón, Plan B alternativo |
| Precisión del OCR | Media | Medio | Validación manual, servicios cloud |
| Rendimiento con alto volumen | Media | Alto | Queue asíncrona, escalado horizontal |
| Pérdida de datos | Baja | Crítico | Backups diarios, replicación, DR plan |
| Cambios en requisitos legales | Media | Medio | Diseño modular, versionado de workflows |
| Adopción baja por usuarios | Media | Alto | UX intuitiva, tutoriales, soporte |
| Brecha de seguridad | Baja | Crítico | Auditoría continua, pentesting, cifrado |
| Suplantación de identidad | Media | Alto | Validación CURP, video-consentimiento |
| DDoS attack | Media | Alto | Cloudflare, rate limiting, WAF |
| Retrasos en desarrollo | Alta | Medio | Sprints con buffer, MVP primero |

---

## 7. Equipo Recomendado

- **1 Tech Lead / Arquitecto**
- **2-3 Backend Developers** (NestJS/Node.js)
- **2 Frontend Developers** (Next.js/React)
- **1 ML/Data Engineer** (OCR)
- **1 DevOps Engineer**
- **1 QA Engineer**
- **1 Product Owner**
- **1 UX/UI Designer**
- **Consultor de Seguridad** (part-time)
- **Consultor Legal** (part-time)

---

## 8. Archivos Críticos para Implementación

Una vez inicializado el proyecto, estos serán los archivos más críticos:

1. `/apps/backend/src/modules/tramites/tramites.service.ts` - Lógica core de gestión de trámites
2. `/apps/backend/src/modules/tramites/workflows/base.workflow.ts` - Clase abstracta de workflows
3. `/apps/backend/src/modules/expedientes/generators/pdf-generator.service.ts` - Generación de PDFs
4. `/apps/frontend/src/components/forms/StepWizard.tsx` - Componente de navegación multi-paso
5. `/apps/backend/src/modules/integraciones/buzon-estatal/buzon-client.service.ts` - Cliente del buzón

---

## 9. Próximos Pasos

1. **Aprobar el plan** con stakeholders y equipo legal
2. **Definir equipo de desarrollo** y roles
3. **Aprovisionar infraestructura inicial** (servidores de desarrollo)
4. **Obtener especificaciones técnicas del Buzón Estatal**
5. **Iniciar Fase 0** - Configuración del proyecto

---

## Referencias

- Documento fuente: `/Users/aaron_flores/Downloads/portal_ciudadano.docx`
- Fecha de creación del plan: 2026-01-16
- Timeline estimado: 20 semanas
- Tecnologías: Next.js, NestJS, PostgreSQL, Redis, MinIO, Docker, Kubernetes
