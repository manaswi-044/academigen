import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
  }
})

/**
 * Upload a file to Cloudflare R2.
 * Returns the public URL of the uploaded file.
 *
 * Key naming convention:
 *   Screenshots : screenshots/{userId}/{docId}/{timestamp}.png
 *   PDFs        : exports/{userId}/{docId}/{timestamp}.pdf
 *   Templates   : templates/{userId}/{timestamp}.pdf
 */
export async function uploadFile(
  file: Buffer | Blob,
  key: string,
  contentType: string
): Promise<string> {
  const body = file instanceof Blob
    ? Buffer.from(await file.arrayBuffer())
    : file

  await R2.send(new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType
  }))

  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}

/**
 * Delete a file from Cloudflare R2 by its key.
 */
export async function deleteFile(key: string): Promise<void> {
  await R2.send(new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key
  }))
}
