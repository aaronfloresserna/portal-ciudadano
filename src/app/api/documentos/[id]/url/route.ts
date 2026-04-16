import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'
import { getPresignedGetUrl, isLegacyPath } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request)
    const invitacionToken = request.headers.get('X-Invitacion-Token')

    if (!userId && !invitacionToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
      include: {
        tramite: {
          include: {
            participantes: true,
            invitaciones: true,
          },
        },
      },
    })

    if (!documento) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    const hasAccess = userId
      ? documento.tramite.participantes.some((p) => p.usuarioId === userId)
      : documento.tramite.invitaciones.some(
          (i) => i.token === invitacionToken && i.estado === 'PENDIENTE'
        )

    if (!hasAccess) {
      return NextResponse.json({ error: 'Sin acceso a este documento' }, { status: 403 })
    }

    if (isLegacyPath(documento.path)) {
      return NextResponse.json({ url: documento.path })
    }

    const url = await getPresignedGetUrl(documento.path)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generando URL de documento:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
