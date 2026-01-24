import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { notificarInvitacionAceptada } from '@/lib/notificaciones';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(authToken);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const usuarioId = payload.userId as string;

    // Obtener usuario autenticado
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener datos del request
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de invitación no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar invitación
    const invitacion = await prisma.invitacion.findUnique({
      where: { token },
      include: {
        tramite: true,
        solicitante: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!invitacion) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el email del usuario coincide con el email invitado
    if (invitacion.emailInvitado !== usuario.email) {
      return NextResponse.json(
        {
          error: 'Esta invitación fue enviada a otro correo electrónico',
          emailEsperado: invitacion.emailInvitado,
          emailActual: usuario.email,
        },
        { status: 403 }
      );
    }

    // Verificar que la invitación está pendiente
    if (invitacion.estado !== 'PENDIENTE') {
      return NextResponse.json(
        {
          error: 'Esta invitación ya no está disponible',
          estado: invitacion.estado,
        },
        { status: 400 }
      );
    }

    // Verificar que no ha expirado
    const ahora = new Date();
    if (invitacion.expiraEn < ahora) {
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: { estado: 'EXPIRADA' },
      });

      return NextResponse.json(
        { error: 'Esta invitación ha expirado' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no está ya participando en el trámite
    const participanteExistente = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId: invitacion.tramiteId,
        usuarioId: usuario.id,
      },
    });

    if (participanteExistente) {
      return NextResponse.json(
        { error: 'Ya estás participando en este trámite' },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar invitación
      await tx.invitacion.update({
        where: { id: invitacion.id },
        data: {
          estado: 'ACEPTADA',
          invitadoId: usuario.id,
          aceptadaEn: new Date(),
        },
      });

      // Crear participante con rol CONYUGE
      const nuevoParticipante = await tx.tramiteParticipante.create({
        data: {
          tramiteId: invitacion.tramiteId,
          usuarioId: usuario.id,
          rol: 'CONYUGE',
          estadoDatos: 'PENDIENTE',
        },
      });

      return nuevoParticipante;
    });

    // Crear notificación para el solicitante
    await notificarInvitacionAceptada(
      invitacion.solicitanteId,
      usuario.nombre,
      invitacion.tramiteId
    );

    return NextResponse.json({
      success: true,
      tramiteId: invitacion.tramiteId,
      participante: {
        id: resultado.id,
        rol: resultado.rol,
      },
    });
  } catch (error) {
    console.error('Error en /api/invitaciones/aceptar:', error);
    return NextResponse.json(
      { error: 'Error al aceptar invitación' },
      { status: 500 }
    );
  }
}
