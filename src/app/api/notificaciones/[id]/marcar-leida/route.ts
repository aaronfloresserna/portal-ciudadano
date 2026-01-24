import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

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
    const notificacionId = params.id;

    // Verificar que la notificación pertenece al usuario
    const notificacion = await prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        usuarioId,
      },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Marcar como leída
    const notificacionActualizada = await prisma.notificacion.update({
      where: { id: notificacionId },
      data: { leida: true },
    });

    return NextResponse.json({
      success: true,
      notificacion: notificacionActualizada,
    });
  } catch (error) {
    console.error('Error en /api/notificaciones/[id]/marcar-leida:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificación como leída' },
      { status: 500 }
    );
  }
}
