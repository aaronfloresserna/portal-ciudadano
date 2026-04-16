import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME!

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
}

/** Generate canonical S3 key for a document */
export function generateS3Key(tramiteId: string, tipo: string, mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType] ?? '.bin'
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `tramites/${tramiteId}/${tipo}_${timestamp}_${random}${ext}`
}

/** Generate a presigned PUT URL (15 min expiry, 20MB max) */
export async function getPresignedPutUrl(
  key: string,
  mimeType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  })
  return getSignedUrl(s3, command, { expiresIn: 900 })
}

/** Generate a presigned GET URL (60 min expiry) */
export async function getPresignedGetUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn: 3600 })
}

/** Returns true if path is a legacy base64 data URI */
export function isLegacyPath(path: string): boolean {
  return path.startsWith('data:')
}
