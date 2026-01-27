-- This migration represents the current state of the database
-- It's designed to be idempotent (can run multiple times safely)

-- Create usuarios table if not exists
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_key ON usuarios(email);

-- Create tramites table if not exists
CREATE TABLE IF NOT EXISTS tramites (
    id TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'DIVORCIO_VOLUNTARIO',
    estado TEXT NOT NULL DEFAULT 'BORRADOR',
    "pasoActual" INTEGER NOT NULL DEFAULT 1,
    datos JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conyuge1Completado" BOOLEAN NOT NULL DEFAULT false,
    "conyuge2Completado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT tramites_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS tramites_estado_idx ON tramites(estado);

-- Create documentos table if not exists
CREATE TABLE IF NOT EXISTS documentos (
    id TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    tipo TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    path TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    size INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT documentos_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS documentos_tramiteId_idx ON documentos("tramiteId");

-- Create expedientes table if not exists
CREATE TABLE IF NOT EXISTS expedientes (
    id TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "hashSha256" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expedientes_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS expedientes_tramiteId_key ON expedientes("tramiteId");

-- Create tramite_participantes table if not exists
CREATE TABLE IF NOT EXISTS tramite_participantes (
    id TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    rol TEXT NOT NULL,
    "estadoDatos" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT tramite_participantes_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS tramite_participantes_tramiteId_usuarioId_key ON tramite_participantes("tramiteId", "usuarioId");
CREATE INDEX IF NOT EXISTS tramite_participantes_tramiteId_idx ON tramite_participantes("tramiteId");
CREATE INDEX IF NOT EXISTS tramite_participantes_usuarioId_idx ON tramite_participantes("usuarioId");

-- Create invitaciones table if not exists
CREATE TABLE IF NOT EXISTS invitaciones (
    id TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "invitadoId" TEXT,
    "emailInvitado" TEXT NOT NULL,
    token TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'PENDIENTE',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceptadaEn" TIMESTAMP(3),
    CONSTRAINT invitaciones_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS invitaciones_token_key ON invitaciones(token);
CREATE INDEX IF NOT EXISTS invitaciones_tramiteId_idx ON invitaciones("tramiteId");
CREATE INDEX IF NOT EXISTS invitaciones_token_idx ON invitaciones(token);
CREATE INDEX IF NOT EXISTS invitaciones_emailInvitado_idx ON invitaciones("emailInvitado");

-- Create notificaciones table if not exists
CREATE TABLE IF NOT EXISTS notificaciones (
    id TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tramiteId" TEXT,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS notificaciones_usuarioId_idx ON notificaciones("usuarioId");
CREATE INDEX IF NOT EXISTS notificaciones_leida_idx ON notificaciones(leida);

-- Add foreign keys (using DO blocks to handle if they already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documentos_tramiteId_fkey'
    ) THEN
        ALTER TABLE documentos ADD CONSTRAINT documentos_tramiteId_fkey
            FOREIGN KEY ("tramiteId") REFERENCES tramites(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'expedientes_tramiteId_fkey'
    ) THEN
        ALTER TABLE expedientes ADD CONSTRAINT expedientes_tramiteId_fkey
            FOREIGN KEY ("tramiteId") REFERENCES tramites(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tramite_participantes_tramiteId_fkey'
    ) THEN
        ALTER TABLE tramite_participantes ADD CONSTRAINT tramite_participantes_tramiteId_fkey
            FOREIGN KEY ("tramiteId") REFERENCES tramites(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tramite_participantes_usuarioId_fkey'
    ) THEN
        ALTER TABLE tramite_participantes ADD CONSTRAINT tramite_participantes_usuarioId_fkey
            FOREIGN KEY ("usuarioId") REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invitaciones_tramiteId_fkey'
    ) THEN
        ALTER TABLE invitaciones ADD CONSTRAINT invitaciones_tramiteId_fkey
            FOREIGN KEY ("tramiteId") REFERENCES tramites(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invitaciones_solicitanteId_fkey'
    ) THEN
        ALTER TABLE invitaciones ADD CONSTRAINT invitaciones_solicitanteId_fkey
            FOREIGN KEY ("solicitanteId") REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invitaciones_invitadoId_fkey'
    ) THEN
        ALTER TABLE invitaciones ADD CONSTRAINT invitaciones_invitadoId_fkey
            FOREIGN KEY ("invitadoId") REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notificaciones_usuarioId_fkey'
    ) THEN
        ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_usuarioId_fkey
            FOREIGN KEY ("usuarioId") REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notificaciones_tramiteId_fkey'
    ) THEN
        ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tramiteId_fkey
            FOREIGN KEY ("tramiteId") REFERENCES tramites(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
