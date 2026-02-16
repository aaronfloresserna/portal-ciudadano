import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { enviarInvitacionEmail } from '@/lib/email';
import { notificarInvitacionRecibida } from '@/lib/notificaciones';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const usuarioId = payload.userId as string;

    // Obtener datos del request
    const body = await req.json();
    const { tramiteId, emailInvitado } = body;

    if (!tramiteId || !emailInvitado) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInvitado)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es el SOLICITANTE del trámite
    const participante = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId,
        usuarioId,
        rol: 'SOLICITANTE',
      },
      include: {
        tramite: true,
        usuario: true,
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'No tienes permiso para enviar invitaciones en este trámite' },
        { status: 403 }
      );
    }

    // Verificar que el trámite está en estado correcto
    if (participante.tramite.estado !== 'ESPERANDO_CONYUGE_2') {
      return NextResponse.json(
        { error: 'El trámite no está en estado para enviar invitaciones' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una invitación pendiente
    const invitacionExistente = await prisma.invitacion.findFirst({
      where: {
        tramiteId,
        emailInvitado,
        estado: 'PENDIENTE',
      },
    });

    if (invitacionExistente) {
      return NextResponse.json(
        { error: 'Ya existe una invitación pendiente para este email' },
        { status: 400 }
      );
    }

    // Generar token único
    const token_invitacion = crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración (7 días)
    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7);

    // Crear invitación
    const invitacion = await prisma.invitacion.create({
      data: {
        tramiteId,
        solicitanteId: usuarioId,
        emailInvitado,
        token: token_invitacion,
        expiraEn,
      },
    });

    // Verificar si el usuario invitado ya existe
    const usuarioInvitado = await prisma.usuario.findUnique({
      where: { email: emailInvitado },
    });

    // Si el usuario existe, crear notificación
    if (usuarioInvitado) {
      await notificarInvitacionRecibida(
        usuarioInvitado.id,
        participante.usuario.nombre,
        tramiteId
      );
    }

    // Enviar email de invitación
    const resultadoEmail = await enviarInvitacionEmail(
      emailInvitado,
      participante.usuario.nombre,
      token_invitacion
    );

    if (!resultadoEmail.success) {
      console.error('Error al enviar email:', resultadoEmail.error);
      // No fallar la operación si el email falla, solo registrar el error
    }

    return NextResponse.json({
      success: true,
      token: token_invitacion, // Token para generar el link
      invitacion: {
        id: invitacion.id,
        emailInvitado: invitacion.emailInvitado,
        expiraEn: invitacion.expiraEn,
      },
    });
  } catch (error) {
    console.error('Error en /api/invitaciones/enviar:', error);
    return NextResponse.json(
      { error: 'Error al enviar invitación' },
      { status: 500 }
    );
  }
}
