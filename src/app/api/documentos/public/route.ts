import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio si no existe
    const uploadDir = process.env.UPLOAD_DIR || './public/uploads'
    const tramiteDir = path.join(uploadDir, tramiteId)

    if (!existsSync(tramiteDir)) {
      mkdirSync(tramiteDir, { recursive: true })
    }

    // Generar nombre de archivo único
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${tipo}_${timestamp}.${extension}`
    const filepath = path.join(tramiteDir, filename)

    // Guardar archivo
    await writeFile(filepath, buffer)

    // Guardar registro en base de datos
    const documento = await prisma.documento.create({
      data: {
        tramiteId,
        tipo,
        nombreArchivo: file.name,
        path: filepath,
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
