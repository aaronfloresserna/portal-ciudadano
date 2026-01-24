import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
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

    // Eliminar notificación
    await prisma.notificacion.delete({
      where: { id: notificacionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada',
    });
  } catch (error) {
    console.error('Error en DELETE /api/notificaciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar notificación' },
      { status: 500 }
    );
  }
}
