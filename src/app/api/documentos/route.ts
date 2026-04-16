import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { key, tramiteId, tipo, mimeType, size, nombreArchivo } = body

    if (!key || !tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Validate key belongs to this tramite (prevent cross-tramite spoofing)
    if (!key.startsWith(`tramites/${tramiteId}/`)) {
      return NextResponse.json({ error: 'Key inválido' }, { status: 400 })
    }

    const participante = await prisma.tramiteParticipante.findFirst({
      where: { tramiteId, usuarioId: userId },
    })
    if (!participante) {
      return NextResponse.json({ error: 'Trámite no encontrado o sin acceso' }, { status: 404 })
    }

    const documento = await prisma.documento.create({
      data: {
        tramiteId,
        tipo,
        nombreArchivo,
        path: key,
        mimeType,
        size,
      },
    })

    return NextResponse.json({ success: true, documento }, { status: 201 })
  } catch (error) {
    console.error('Error al registrar documento:', error)
    return NextResponse.json({ error: 'Error al registrar documento' }, { status: 500 })
  }
}

// GET /api/documentos?tramiteId=xxx - Obtener documentos de un trámite
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tramiteId = searchParams.get('tramiteId')

    if (!tramiteId) {
      return NextResponse.json(
        { error: 'tramiteId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario es participante del trámite
    const participante = await prisma.tramiteParticipante.findFirst({
      where: {
        tramiteId,
        usuarioId: userId,
      },
    })

    if (!participante) {
      return NextResponse.json(
        { error: 'Trámite no encontrado o sin acceso' },
        { status: 404 }
      )
    }

    const documentos = await prisma.documento.findMany({
      where: { tramiteId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      documentos,
    })
  } catch (error) {
    console.error('Error al obtener documentos:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}
