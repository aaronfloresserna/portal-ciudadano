import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'

// GET /api/tramites/:id - Obtener un trámite específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const tramite = await prisma.tramite.findFirst({
      where: {
        id: params.id,
        usuarioId: userId,
      },
      include: {
        documentos: true,
        expediente: true,
      },
    })

    if (!tramite) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tramite,
    })
  } catch (error) {
    console.error('Error al obtener trámite:', error)
    return NextResponse.json(
      { error: 'Error al obtener trámite' },
      { status: 500 }
    )
  }
}

// PATCH /api/tramites/:id - Actualizar un trámite
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el trámite pertenece al usuario
    const tramiteExistente = await prisma.tramite.findFirst({
      where: {
        id: params.id,
        usuarioId: userId,
      },
    })

    if (!tramiteExistente) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { pasoActual, datos, estado } = body

    // Hacer merge de los datos nuevos con los existentes
    const datosActualizados = {
      ...(tramiteExistente.datos as object),
      ...(datos || {}),
    }

    const tramite = await prisma.tramite.update({
      where: { id: params.id },
      data: {
        ...(pasoActual !== undefined && { pasoActual }),
        ...(datos && { datos: datosActualizados }),
        ...(estado && { estado }),
      },
    })

    return NextResponse.json({
      success: true,
      tramite,
    })
  } catch (error) {
    console.error('Error al actualizar trámite:', error)
    return NextResponse.json(
      { error: 'Error al actualizar trámite' },
      { status: 500 }
    )
  }
}

// DELETE /api/tramites/:id - Eliminar un trámite
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el trámite pertenece al usuario
    const tramite = await prisma.tramite.findFirst({
      where: {
        id: params.id,
        usuarioId: userId,
      },
    })

    if (!tramite) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    await prisma.tramite.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Trámite eliminado',
    })
  } catch (error) {
    console.error('Error al eliminar trámite:', error)
    return NextResponse.json(
      { error: 'Error al eliminar trámite' },
      { status: 500 }
    )
  }
}
