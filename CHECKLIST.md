# ✅ Checklist de Deployment y Testing

## Pre-Deployment

### Código
- [x] Prisma schema actualizado con nuevos modelos
- [x] Migraciones creadas
- [x] API endpoints implementados
- [x] Componentes UI creados
- [x] Zustand stores configurados
- [x] Variables de entorno documentadas

### Archivos de Configuración
- [x] `.env.example` creado
- [x] `vercel.json` configurado
- [x] `package.json` con scripts de build
- [x] `.gitignore` actualizado
- [x] README.md completo
- [x] DEPLOYMENT.md con guía paso a paso

## Durante Deployment en Vercel

### 1. Configuración Inicial
- [ ] Repositorio subido a GitHub
- [ ] Proyecto creado en Vercel
- [ ] Base de datos Postgres creada en Vercel
- [ ] Variables de entorno configuradas

### 2. Variables de Entorno Requeridas

#### Base de Datos (Auto-generadas por Vercel Postgres)
- [ ] `DATABASE_URL`
- [ ] `POSTGRES_URL`
- [ ] `POSTGRES_PRISMA_URL`
- [ ] `POSTGRES_URL_NON_POOLING`

#### Autenticación
- [ ] `JWT_SECRET` (genera uno: `openssl rand -base64 32`)

#### Aplicación
- [ ] `NEXT_PUBLIC_APP_NAME` = "Portal Ciudadano"
- [ ] `NEXT_PUBLIC_APP_URL` = "https://tu-app.vercel.app"
- [ ] `UPLOAD_DIR` = "./public/uploads"

#### Email (SMTP)
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`
- [ ] `SMTP_FROM`

### 3. Build y Deploy
- [ ] Build exitoso (sin errores)
- [ ] Migraciones ejecutadas correctamente
- [ ] Deploy completado
- [ ] URL de producción accesible

## Post-Deployment - Testing

### Verificaciones Básicas
- [ ] La página principal carga correctamente
- [ ] Los assets (CSS, imágenes, logos) se cargan
- [ ] No hay errores en la consola del navegador
- [ ] La página de login es accesible
- [ ] La página de registro es accesible

### Test 1: Registro y Autenticación
- [ ] Registrar nuevo usuario (Cónyuge 1)
  - Email: `test.conyuge1@gmail.com`
  - Nombre: "Juan Pérez"
  - Contraseña: (segura)
- [ ] Login exitoso
- [ ] Token JWT guardado correctamente
- [ ] Redirige a dashboard
- [ ] Logout funciona

### Test 2: Crear Trámite (Cónyuge 1)
- [ ] Click en "Nuevo Trámite de Divorcio"
- [ ] Paso 1: Bienvenida se muestra
- [ ] Paso 2: Ingresar nombre del cónyuge 1
- [ ] Paso 3: Ingresar apellidos
- [ ] Paso 4: Ingresar CURP (18 caracteres)
- [ ] Paso 5: Fecha de nacimiento
- [ ] Paso 6: Subir INE frontal (imagen)
- [ ] Paso 7: Subir INE trasera (imagen)
- [ ] Al completar, redirige a página de invitación
- [ ] Verificar que el trámite está en estado `ESPERANDO_CONYUGE_2`

### Test 3: Sistema de Invitaciones
- [ ] Página de invitación muestra formulario
- [ ] Ingresar email válido del Cónyuge 2
- [ ] Click en "Enviar Invitación"
- [ ] Mensaje de éxito aparece
- [ ] Email recibido en bandeja (verificar spam)
- [ ] Email contiene:
  - [ ] Nombre del solicitante
  - [ ] Link de invitación con token
  - [ ] Instrucciones claras
  - [ ] Fecha de expiración (7 días)

### Test 4: Notificaciones
- [ ] Campanilla de notificaciones visible en header
- [ ] Badge con número "0" o sin badge si no hay notificaciones
- [ ] (Después de eventos) Badge muestra número correcto
- [ ] Click en campanilla abre dropdown
- [ ] Notificaciones se muestran en lista
- [ ] Click en notificación marca como leída
- [ ] Click en notificación navega al trámite
- [ ] Botón "Marcar todas como leídas" funciona
- [ ] Botón eliminar (X) funciona

### Test 5: Aceptar Invitación (Cónyuge 2)
- [ ] Abrir link del email en navegador
- [ ] Página "Aceptar Invitación" se carga
- [ ] Muestra información del solicitante
- [ ] Si no está logueado, muestra botón para login/registro
- [ ] Registrar nueva cuenta con email invitado
  - Email: `test.conyuge2@gmail.com`
  - Nombre: "María López"
- [ ] Después de login, botón "Aceptar Invitación" habilitado
- [ ] Click en "Aceptar Invitación"
- [ ] Mensaje de éxito
- [ ] Redirige al formulario del trámite
- [ ] Notificación creada para Cónyuge 1

### Test 6: Completar Datos (Cónyuge 2)
- [ ] Formulario muestra pasos del Cónyuge 2
- [ ] Paso 8: Nombre del cónyuge 2
- [ ] Paso 9: Apellidos
- [ ] Paso 10: CURP
- [ ] Paso 11: Fecha de nacimiento
- [ ] Paso 12: INE frontal
- [ ] Paso 13: INE trasera
- [ ] Al completar, redirige a confirmación
- [ ] Trámite cambia a estado `EN_PROGRESO`
- [ ] Notificación enviada a Cónyuge 1

### Test 7: Completar Datos Compartidos
- [ ] Login como Cónyuge 1 o Cónyuge 2
- [ ] Abrir el trámite
- [ ] Solo se muestran pasos compartidos
- [ ] Paso: Fecha de matrimonio
- [ ] Paso: Ciudad de matrimonio
- [ ] Paso: Estado de matrimonio
- [ ] Paso: ¿Tienen hijos? (Sí/No)

#### Si tienen hijos:
- [ ] Paso: Número de hijos
- [ ] Paso: Formulario de datos de cada hijo
- [ ] Paso: ¿Con quién vivirá?
- [ ] Paso: Días de convivencia
- [ ] Paso: Horarios de entrega/recogida
- [ ] Paso: Convivencia en vacaciones
- [ ] Paso: Gastos médicos
- [ ] Paso: Gastos escolares
- [ ] Paso: Pensión alimenticia

#### Datos del domicilio:
- [ ] Paso: Calle
- [ ] Paso: Número
- [ ] Paso: Colonia

#### Documentos:
- [ ] Paso: Subir acta de matrimonio

#### Firmas:
- [ ] Paso: Firma del cónyuge 1
- [ ] Paso: Aviso para cónyuge 2
- [ ] Paso: Firma del cónyuge 2
- [ ] Al completar, redirige a confirmación
- [ ] Trámite cambia a estado `COMPLETADO`

### Test 8: Generación de PDF
- [ ] Página de confirmación muestra resumen
- [ ] Botón "Generar Convenio" visible
- [ ] Click en "Generar Convenio"
- [ ] PDF se genera correctamente
- [ ] PDF se descarga
- [ ] PDF contiene todos los datos ingresados
- [ ] PDF incluye firmas digitales

### Test 9: Dashboard y Listado
- [ ] Dashboard muestra trámites del usuario
- [ ] Trámites muestran:
  - [ ] Tipo de trámite
  - [ ] Estado actual
  - [ ] Fecha de creación
  - [ ] Rol del usuario (SOLICITANTE/CONYUGE)
- [ ] Click en trámite abre el formulario
- [ ] Filtros funcionan (si existen)

### Test 10: Casos Edge

#### Invitación Expirada
- [ ] Link de invitación expirada muestra error
- [ ] Mensaje claro de "invitación expirada"

#### Email Incorrecto
- [ ] Usuario con email diferente intenta aceptar
- [ ] Muestra error: "Esta invitación fue enviada a otro correo"

#### Invitación Ya Aceptada
- [ ] Intentar usar link ya aceptado
- [ ] Muestra: "Esta invitación ya fue aceptada"

#### Permisos
- [ ] Usuario no participante no puede ver trámite
- [ ] Error 403 o 404 al intentar acceder
- [ ] Cónyuge no puede editar datos del otro (en estados BORRADOR/ESPERANDO)

#### Validaciones
- [ ] CURP requiere exactamente 18 caracteres
- [ ] Emails requieren formato válido
- [ ] Campos requeridos no se pueden omitir
- [ ] Archivos solo aceptan formatos especificados

### Test 11: Performance y UX
- [ ] Página carga en < 3 segundos
- [ ] Transiciones suaves entre pasos
- [ ] Loading states visibles durante requests
- [ ] Mensajes de error claros y útiles
- [ ] Guardado automático funciona
- [ ] Botón "Atrás" mantiene datos
- [ ] Polling de notificaciones no causa lag
- [ ] Imágenes se cargan correctamente
- [ ] Responsive en móvil

### Test 12: Seguridad
- [ ] Rutas protegidas requieren autenticación
- [ ] JWT expira correctamente
- [ ] Contraseñas hasheadas (no visibles en DB)
- [ ] HTTPS habilitado (Vercel lo hace automático)
- [ ] No hay secretos en código frontend
- [ ] API endpoints validan autenticación
- [ ] Validación server-side en todos los endpoints

## Problemas Comunes y Soluciones

### Build Falla
```bash
# Ver logs en Vercel
vercel logs --follow

# Verificar localmente
npm run build
```

### Migraciones Fallan
```bash
# Aplicar manualmente
vercel env pull .env.local
npx prisma migrate deploy
```

### Emails No Se Envían
- Verificar credenciales SMTP en variables de entorno
- Si usas Gmail: usar "Contraseña de aplicación"
- Verificar logs: `vercel logs`
- Probar con servicio de email alternativo (SendGrid)

### Notificaciones No Aparecen
- Verificar que Header tiene `'use client'`
- Abrir consola del navegador para errores
- Verificar que polling está activo
- Verificar que endpoint `/api/notificaciones` responde

### Base de Datos No Conecta
- Verificar que Vercel Postgres está activo
- Verificar variable `DATABASE_URL`
- Probar conexión con: `npx prisma db pull`

## Sign-off

Deployment completado por: ________________
Fecha: ________________
Todos los tests pasaron: [ ] Sí  [ ] No
Notas adicionales:
_________________________________
_________________________________
_________________________________
