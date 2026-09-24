import type { H3Event } from 'h3'

/**
 * Read JSON while enforcing a byte ceiling as chunks arrive. Checking only
 * Content-Length is insufficient because chunked requests omit that header.
 */
export async function readJsonBodyLimited<T>(
  event: H3Event,
  maxBytes: number,
): Promise<T> {
  const contentType = getRequestHeader(event, 'content-type') || ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw createError({ statusCode: 415, statusMessage: 'Content-Type must be application/json' })
  }

  const declared = Number(getRequestHeader(event, 'content-length') || 0)
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Request body too large' })
  }

  const stream = getRequestWebStream(event)
  if (!stream) {
    throw createError({ statusCode: 400, statusMessage: 'JSON body required' })
  }

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
      total += bytes.byteLength
      if (total > maxBytes) {
        await reader.cancel('Request body too large')
        throw createError({ statusCode: 413, statusMessage: 'Request body too large' })
      }
      chunks.push(bytes)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder().decode(body)) as T
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }
}
