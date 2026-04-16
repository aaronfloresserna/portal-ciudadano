import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const invitacionToken = request.headers.get('X-Invitacion-Token')
    if (!invitacionToken) {
      return NextResponse.json({ error: 'Token de invitación no proporcionado' }, { status: 401 })
    }

    const body = await request.json()
    const { key, tramiteId, tipo, mimeType, size, nombreArchivo } = body

    if (!key || !tramiteId || !tipo || !mimeType || !size || !nombreArchivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!key.startsWith(`tramites/${tramiteId}/`)) {
      return NextResponse.json({ error: 'Key inválido' }, { status: 400 })
    }

    const invitacion = await prisma.invitacion.findFirst({
      where: {
        token: invitacionToken,
        tramiteId,
        estado: 'PENDIENTE',
        expiraEn: { gt: new Date() },
      },
    })
    if (!invitacion) {
      return NextResponse.json({ error: 'Invitación no válida o expirada' }, { status: 403 })
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

    return NextResponse.json({ success: true, documento })
  } catch (error) {
    console.error('Error al registrar documento público:', error)
    return NextResponse.json({ error: 'Error al registrar documento' }, { status: 500 })
  }
}
