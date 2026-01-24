import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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

    // Obtener parámetros de paginación
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Obtener notificaciones del usuario
    const [notificaciones, total, noLeidas] = await Promise.all([
      prisma.notificacion.findMany({
        where: {
          usuarioId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          tramite: {
            select: {
              id: true,
              tipo: true,
              estado: true,
            },
          },
        },
      }),
      prisma.notificacion.count({
        where: {
          usuarioId,
        },
      }),
      prisma.notificacion.count({
        where: {
          usuarioId,
          leida: false,
        },
      }),
    ]);

    return NextResponse.json({
      notificaciones,
      total,
      noLeidas,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error en /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}
