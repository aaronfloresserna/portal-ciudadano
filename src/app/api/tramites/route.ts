import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'

// GET /api/tramites - Obtener todos los trámites del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar trámites donde el usuario es participante
    const participaciones = await prisma.tramiteParticipante.findMany({
      where: { usuarioId: userId },
      include: {
        tramite: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const tramites = participaciones.map((p) => ({
      ...p.tramite,
      miRol: p.rol,
      miEstadoDatos: p.estadoDatos,
    }))

    return NextResponse.json({
      success: true,
      tramites,
    })
  } catch (error) {
    console.error('Error al obtener trámites:', error)
    return NextResponse.json(
      { error: 'Error al obtener trámites' },
      { status: 500 }
    )
  }
}

// POST /api/tramites - Crear un nuevo trámite
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      console.error('POST /api/tramites - No autorizado: userId no encontrado')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('POST /api/tramites - Creando trámite para userId:', userId)

    const body = await request.json()
    const { tipo = 'DIVORCIO_VOLUNTARIO' } = body

    // Usar transacción para crear el trámite y el participante
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear el trámite
      const tramite = await tx.tramite.create({
        data: {
          tipo,
          estado: 'BORRADOR',
          pasoActual: 1,
          datos: {},
        },
      })

      console.log('POST /api/tramites - Trámite creado:', tramite.id)

      // Crear el participante con rol SOLICITANTE
      await tx.tramiteParticipante.create({
        data: {
          tramiteId: tramite.id,
          usuarioId: userId,
          rol: 'SOLICITANTE',
          estadoDatos: 'PENDIENTE',
        },
      })

      console.log('POST /api/tramites - Participante creado para trámite:', tramite.id)

      return tramite
    })

    console.log('POST /api/tramites - Éxito, retornando trámite:', resultado.id)

    return NextResponse.json({
      success: true,
      tramite: resultado,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear trámite:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    return NextResponse.json(
      { error: 'Error al crear trámite', details: error.message },
      { status: 500 }
    )
  }
}
