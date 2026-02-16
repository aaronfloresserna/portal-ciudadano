import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'
import crypto from 'crypto'

// POST /api/documentos - Subir un documento
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tramiteId = formData.get('tramiteId') as string
    const tipo = formData.get('tipo') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!tramiteId || !tipo) {
      return NextResponse.json(
        { error: 'tramiteId y tipo son requeridos' },
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

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG) y PDF' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB para Vercel serverless)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 10MB. Por favor comprime la imagen.' },
        { status: 400 }
      )
    }

    // Convertir archivo a base64 (para Vercel serverless)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Generar un ID único para el archivo
    const fileId = `${tipo}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`

    // Guardar en la base de datos con el contenido en base64
    const documento = await prisma.documento.create({
      data: {
        tramiteId,
        tipo,
        nombreArchivo: file.name,
        path: `data:${file.type};base64,${base64}`, // Data URI para acceso directo
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      documento,
    }, { status: 201 })
  } catch (error) {
    console.error('Error al subir documento:', error)
    return NextResponse.json(
      { error: 'Error al subir documento' },
      { status: 500 }
    )
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
