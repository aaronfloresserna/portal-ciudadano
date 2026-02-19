import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Obtener token de los query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar invitación
    const invitacion = await prisma.invitacion.findUnique({
      where: { token },
      include: {
        tramite: {
          select: {
            id: true,
            tipo: true,
            estado: true,
            datos: true,
          },
        },
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
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

    // Verificar si la invitación ya fue aceptada
    if (invitacion.estado === 'ACEPTADA') {
      return NextResponse.json(
        {
          error: 'Esta invitación ya fue aceptada',
          status: 'ACEPTADA'
        },
        { status: 400 }
      );
    }

    // Verificar si la invitación fue rechazada
    if (invitacion.estado === 'RECHAZADA') {
      return NextResponse.json(
        {
          error: 'Esta invitación fue rechazada',
          status: 'RECHAZADA'
        },
        { status: 400 }
      );
    }

    // Verificar si la invitación expiró
    const ahora = new Date();
    if (invitacion.expiraEn < ahora) {
      // Actualizar estado a EXPIRADA
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: { estado: 'EXPIRADA' },
      });

      return NextResponse.json(
        {
          error: 'Esta invitación ha expirado',
          status: 'EXPIRADA',
          expiraEn: invitacion.expiraEn
        },
        { status: 400 }
      );
    }

    // Invitación válida
    return NextResponse.json({
      success: true,
      invitacion: {
        id: invitacion.id,
        tramiteId: invitacion.tramiteId,
        emailInvitado: invitacion.emailInvitado,
        expiraEn: invitacion.expiraEn,
        solicitante: {
          nombre: invitacion.solicitante.nombre,
          email: invitacion.solicitante.email,
        },
        tramite: {
          id: invitacion.tramite.id,
          tipo: invitacion.tramite.tipo,
          estado: invitacion.tramite.estado,
          datos: invitacion.tramite.datos,
        },
      },
    });
  } catch (error) {
    console.error('Error en /api/invitaciones/verificar:', error);
    return NextResponse.json(
      { error: 'Error al verificar invitación' },
      { status: 500 }
    );
  }
}
