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

    // Verificar que el usuario es participante del trámite
    const participante = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId: params.id,
        usuarioId: userId,
      },
    })

    if (!participante) {
      return NextResponse.json(
        { error: 'Trámite no encontrado o sin acceso' },
        { status: 404 }
      )
    }

    // Obtener el trámite con todas sus relaciones
    const tramite = await prisma.tramite.findUnique({
      where: { id: params.id },
      include: {
        documentos: true,
        expediente: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
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
      tramite: {
        ...tramite,
        miRol: participante.rol,
        miEstadoDatos: participante.estadoDatos,
      },
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

    // Verificar que el usuario es participante del trámite
    const participante = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId: params.id,
        usuarioId: userId,
      },
    })

    if (!participante) {
      return NextResponse.json(
        { error: 'Trámite no encontrado o sin acceso' },
        { status: 404 }
      )
    }

    const tramiteExistente = await prisma.tramite.findUnique({
      where: { id: params.id },
    })

    if (!tramiteExistente) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { pasoActual, datos, estado, marcarDatosCompletados } = body

    // Validar permisos según rol y estado del trámite
    if (datos && tramiteExistente.estado !== 'EN_PROGRESO') {
      const datosKeys = Object.keys(datos)

      // Si es SOLICITANTE, no puede editar campos de conyuge2
      if (participante.rol === 'SOLICITANTE') {
        const camposProhibidos = datosKeys.filter((key) =>
          key.startsWith('conyuge2_')
        )
        if (camposProhibidos.length > 0) {
          return NextResponse.json(
            { error: 'No tienes permiso para editar los datos del otro cónyuge' },
            { status: 403 }
          )
        }
      }

      // Si es CONYUGE, no puede editar campos de conyuge1
      if (participante.rol === 'CONYUGE') {
        const camposProhibidos = datosKeys.filter((key) =>
          key.startsWith('conyuge1_')
        )
        if (camposProhibidos.length > 0) {
          return NextResponse.json(
            { error: 'No tienes permiso para editar los datos del otro cónyuge' },
            { status: 403 }
          )
        }
      }
    }

    // Hacer merge de los datos nuevos con los existentes
    const datosActualizados = {
      ...(tramiteExistente.datos as object),
      ...(datos || {}),
    }

    // Preparar actualizaciones
    const actualizaciones: any = {
      ...(pasoActual !== undefined && { pasoActual }),
      ...(datos && { datos: datosActualizados }),
      ...(estado && { estado }),
    }

    // Si se marca como datos completados
    if (marcarDatosCompletados) {
      if (participante.rol === 'SOLICITANTE') {
        actualizaciones.conyuge1Completado = true
        actualizaciones.estado = 'ESPERANDO_CONYUGE_2'

        // Actualizar estado del participante
        await prisma.tramiteParticipante.update({
          where: { id: participante.id },
          data: { estadoDatos: 'COMPLETADO' },
        })
      } else if (participante.rol === 'CONYUGE') {
        actualizaciones.conyuge2Completado = true
        actualizaciones.estado = 'EN_PROGRESO'

        // Actualizar estado del participante
        await prisma.tramiteParticipante.update({
          where: { id: participante.id },
          data: { estadoDatos: 'COMPLETADO' },
        })
      }
    }

    const tramite = await prisma.tramite.update({
      where: { id: params.id },
      data: actualizaciones,
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

    // Verificar que el usuario es SOLICITANTE del trámite (solo el solicitante puede eliminar)
    const participante = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId: params.id,
        usuarioId: userId,
        rol: 'SOLICITANTE',
      },
    })

    if (!participante) {
      return NextResponse.json(
        { error: 'Solo el solicitante puede eliminar el trámite' },
        { status: 403 }
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
