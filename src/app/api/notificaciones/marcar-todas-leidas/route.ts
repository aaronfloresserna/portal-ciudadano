import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    // Marcar todas las notificaciones como leídas
    const resultado = await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    return NextResponse.json({
      success: true,
      actualizadas: resultado.count,
    });
  } catch (error) {
    console.error('Error en /api/notificaciones/marcar-todas-leidas:', error);
    return NextResponse.json(
      { error: 'Error al marcar notificaciones como leídas' },
      { status: 500 }
    );
  }
}
