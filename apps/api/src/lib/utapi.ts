import { UTApi } from 'uploadthing/server'

// Single shared instance — reads UPLOADTHING_SECRET from env automatically
export const utapi = new UTApi()

/**
 * Upload a file buffer to Uploadthing CDN.
 * Returns { url, key } on success, throws on failure.
 */
export async function uploadToCloud(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; key: string }> {
  const file = new File([buffer], filename, { type: mimeType })
  const result = await utapi.uploadFiles(file)
  if (result.error) {
    throw new Error(`Upload failed: ${result.error.message}`)
  }
  return { url: result.data.url, key: result.data.key }
}

/**
 * Delete one or more files from Uploadthing by their keys.
 */
export async function deleteFromCloud(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await utapi.deleteFiles(keys)
}
