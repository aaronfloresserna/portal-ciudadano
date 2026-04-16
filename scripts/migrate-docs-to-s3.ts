/**
 * One-time migration: moves base64 documents from DB to S3.
 * Idempotent: skips rows where path does NOT start with 'data:'.
 *
 * Usage:
 *   npx ts-node scripts/migrate-docs-to-s3.ts [--dry-run] [--limit N]
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import 'dotenv/config'

const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.indexOf('--limit')
const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : undefined

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'application/pdf': '.pdf',
}

async function main() {
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}${limit ? ` | Limit: ${limit}` : ''}`)

  const documentos = await prisma.documento.findMany({
    where: { path: { startsWith: 'data:' } },
    take: limit,
  })

  console.log(`Found ${documentos.length} documents to migrate`)

  let migrated = 0
  let failed = 0

  for (const doc of documentos) {
    try {
      // Parse data URI: data:{mimeType};base64,{data}
      const match = doc.path.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        console.error(`  ✗ ${doc.id}: unrecognized path format`)
        failed++
        continue
      }

      const [, mimeType, b64] = match
      const buffer = Buffer.from(b64, 'base64')
      const ext = MIME_TO_EXT[mimeType] ?? '.bin'
      // Migration keys use doc.id for determinism (vs timestamp+random for new uploads)
      const key = `tramites/${doc.tramiteId}/${doc.tipo}_${doc.id}${ext}`

      if (isDryRun) {
        console.log(`  [dry] ${doc.id} → ${key} (${buffer.length} bytes)`)
        migrated++
        continue
      }

      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }))

      await prisma.documento.update({
        where: { id: doc.id },
        data: { path: key },
      })

      console.log(`  ✓ ${doc.id} → ${key}`)
      migrated++
    } catch (err: any) {
      console.error(`  ✗ ${doc.id}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone. Migrated: ${migrated} | Failed: ${failed}`)
  await prisma.$disconnect()
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
