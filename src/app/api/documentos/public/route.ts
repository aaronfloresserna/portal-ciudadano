import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// POST /api/documentos/public - Subir documento sin autenticación (usa token de invitación)
export async function POST(request: NextRequest) {
  try {
    // Obtener token de invitación de headers
    const invitacionToken = request.headers.get('X-Invitacion-Token')

    if (!invitacionToken) {
      return NextResponse.json(
        { error: 'Token de invitación no proporcionado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tramiteId = formData.get('tramiteId') as string
    const tipo = formData.get('tipo') as string

    if (!file || !tramiteId || !tipo) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Validar tamaño del archivo (máximo 4MB para Vercel serverless - límite real 4.5MB)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 4MB. Por favor comprime la imagen antes de subirla.' },
        { status: 400 }
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

    // Verificar que el token de invitación sea válido para este trámite
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

    // Convertir archivo a base64 (compatible con Vercel serverless)
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
        path: `data:${file.type};base64,${base64}`,
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      documento,
    })
  } catch (error) {
    console.error('Error al subir documento:', error)
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }
}
