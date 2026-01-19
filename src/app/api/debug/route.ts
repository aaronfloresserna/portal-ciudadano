import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Verificar DATABASE_URL (ocultar contraseña)
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET'
    const hiddenUrl = dbUrl.replace(/:([^@]+)@/, ':****@')
    
    // Intentar query simple
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`
    
    // Verificar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    return NextResponse.json({
      status: 'ok',
      database_url: hiddenUrl,
      current_db: result,
      tables: tables,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
