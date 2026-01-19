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

    const tramites = await prisma.tramite.findMany({
      where: { usuarioId: userId },
      include: {
        documentos: true,
        expediente: true,
      },
      orderBy: { createdAt: 'desc' },
    })

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
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tipo = 'DIVORCIO_VOLUNTARIO' } = body

    // Crear el trámite
    const tramite = await prisma.tramite.create({
      data: {
        usuarioId: userId,
        tipo,
        estado: 'BORRADOR',
        pasoActual: 1,
        datos: {},
      },
    })

    return NextResponse.json({
      success: true,
      tramite,
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear trámite:', error)
    return NextResponse.json(
      { error: 'Error al crear trámite' },
      { status: 500 }
    )
  }
}
