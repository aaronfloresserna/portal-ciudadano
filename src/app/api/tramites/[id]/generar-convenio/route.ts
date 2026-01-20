import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { ConvenioDivorcio } from '@/lib/pdf/templates/ConvenioDivorcio'
import React from 'react'

export async function POST(
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

    // Obtener el trámite con todos los datos
    const tramite = await prisma.tramite.findFirst({
      where: {
        id: params.id,
        usuarioId: userId,
      },
    })

    if (!tramite) {
      return NextResponse.json(
        { error: 'Trámite no encontrado' },
        { status: 404 }
      )
    }

    // Generar el PDF usando React.createElement
    const documento = React.createElement(ConvenioDivorcio, {
      datos: tramite.datos as any
    })

    // Renderizar a Buffer
    const buffer = await renderToBuffer(documento)

    // Retornar el PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="convenio-divorcio-${params.id}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error al generar convenio:', error)
    return NextResponse.json(
      { error: 'Error al generar convenio', details: error.message },
      { status: 500 }
    )
  }
}
