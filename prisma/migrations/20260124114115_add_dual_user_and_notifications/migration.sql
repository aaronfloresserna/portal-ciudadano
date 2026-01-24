-- CreateTable
CREATE TABLE "tramite_participantes" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "estadoDatos" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tramite_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitaciones" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "invitadoId" TEXT,
    "emailInvitado" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceptadaEn" TIMESTAMP(3),

    CONSTRAINT "invitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tramiteId" TEXT,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "tramites" DROP COLUMN "usuarioId",
ADD COLUMN "conyuge1Completado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "conyuge2Completado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "tramite_participantes_tramiteId_usuarioId_key" ON "tramite_participantes"("tramiteId", "usuarioId");

-- CreateIndex
CREATE INDEX "tramite_participantes_tramiteId_idx" ON "tramite_participantes"("tramiteId");

-- CreateIndex
CREATE INDEX "tramite_participantes_usuarioId_idx" ON "tramite_participantes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_token_key" ON "invitaciones"("token");

-- CreateIndex
CREATE INDEX "invitaciones_tramiteId_idx" ON "invitaciones"("tramiteId");

-- CreateIndex
CREATE INDEX "invitaciones_token_idx" ON "invitaciones"("token");

-- CreateIndex
CREATE INDEX "invitaciones_emailInvitado_idx" ON "invitaciones"("emailInvitado");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_idx" ON "notificaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- AddForeignKey
ALTER TABLE "tramite_participantes" ADD CONSTRAINT "tramite_participantes_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_participantes" ADD CONSTRAINT "tramite_participantes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_invitadoId_fkey" FOREIGN KEY ("invitadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
