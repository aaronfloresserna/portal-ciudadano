import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PATCH /api/tramites/:id/conyuge2 - Actualizar datos del cónyuge 2 (sin auth, usa token de invitación)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const tramiteId = params.id

    // Obtener token de invitación de headers
    const invitacionToken = request.headers.get('X-Invitacion-Token')

    if (!invitacionToken) {
      return NextResponse.json(
        { error: 'Token de invitación no proporcionado' },
        { status: 401 }
      )
    }

    // Verificar que el token de invitación sea válido
    const invitacion = await prisma.invitacion.findFirst({
      where: {
        token: invitacionToken,
        tramiteId: tramiteId,
        estado: 'PENDIENTE',
        expiraEn: {
          gt: new Date(),
        },
      },
    })

    if (!invitacion) {
      return NextResponse.json(
        { error: 'Invitación no válida o expirada' },
        { status: 403 }
      )
    }

    const tramiteExistente = await prisma.tramite.findUnique({
      where: { id: tramiteId },
    })

    if (!tramiteExistente) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { datos, completado } = body

    // Hacer merge de los datos nuevos con los existentes
    const datosActualizados = {
      ...(tramiteExistente.datos as object),
      ...(datos || {}),
    }

    // Preparar actualizaciones
    const actualizaciones: any = {
      datos: datosActualizados,
    }

    // Si se marca como completado, cambiar estado del trámite
    if (completado) {
      actualizaciones.estado = 'EN_PROGRESO'

      // Marcar invitación como aceptada
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: {
          estado: 'ACEPTADA',
          aceptadaEn: new Date(),
        },
      })

      // Crear notificación para el solicitante
      await prisma.notificacion.create({
        data: {
          usuarioId: invitacion.solicitanteId,
          tramiteId: tramiteId,
          tipo: 'PROGRESO',
          titulo: 'El segundo cónyuge completó sus datos',
          mensaje: 'Tu cónyuge ha completado sus datos personales. Ya pueden continuar juntos con el resto del trámite.',
        },
      })
    }

    const tramite = await prisma.tramite.update({
      where: { id: tramiteId },
      data: actualizaciones,
    })

    return NextResponse.json({
      success: true,
      tramite,
    })
  } catch (error) {
    console.error('Error al actualizar datos del cónyuge 2:', error)
    return NextResponse.json(
      { error: 'Error al actualizar datos' },
      { status: 500 }
    )
  }
}
