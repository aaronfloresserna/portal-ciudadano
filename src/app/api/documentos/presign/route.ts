import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'
import { generateS3Key, getPresignedPutUrl } from '@/lib/s3'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_SIZE = 20 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tramiteId, tipo, mimeType, size, nombreArchivo } = body

    if (!tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo JPG, PNG y PDF.' },
        { status: 400 }
      )
    }

    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 20MB.' },
        { status: 400 }
      )
    }

    const participante = await prisma.tramiteParticipante.findFirst({
      where: { tramiteId, usuarioId: userId },
    })
    if (!participante) {
      return NextResponse.json({ error: 'Trámite no encontrado o sin acceso' }, { status: 404 })
    }

    const key = generateS3Key(tramiteId, tipo, mimeType)
    const uploadUrl = await getPresignedPutUrl(key, mimeType)

    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    console.error('Error generando presign URL:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
