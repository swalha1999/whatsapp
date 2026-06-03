import { afterEach, describe, expect, it, vi } from 'vitest'

import { createWhatsApp } from './create-whatsapp'

const wa = createWhatsApp({ apiToken: 'token', phoneNumberId: '123' })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('downloadMedia', () => {
  it('resolves the media url then fetches the bytes', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer
    const fetchMock = vi
      .fn()
      // 1. metadata lookup
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://lookaside.fbsbx.com/media/abc',
          mime_type: 'image/jpeg',
          file_size: 4,
          sha256: 'deadbeef',
          id: 'MEDIA_ID',
        }),
      })
      // 2. byte download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => bytes,
      })
    vi.stubGlobal('fetch', fetchMock)

    const result = await wa.downloadMedia('MEDIA_ID')

    expect(result.success).toBe(true)
    expect(result.mimeType).toBe('image/jpeg')
    expect(result.fileSize).toBe(4)
    expect(result.data).toBe(bytes)

    // Both requests carry the bearer token.
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('/MEDIA_ID')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token')
    expect(fetchMock.mock.calls[1][0]).toBe('https://lookaside.fbsbx.com/media/abc')
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer token')
  })

  it('returns a failure result when the lookup fails', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'not found', code: 100 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await wa.downloadMedia('MISSING')

    expect(result.success).toBe(false)
    expect(result.error).toEqual({ code: 100, message: 'not found' })
  })
})

describe('uploadMedia', () => {
  it('posts multipart form data and returns the media id', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'UPLOADED_ID' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await wa.uploadMedia({
      file: new Uint8Array([1, 2, 3]),
      type: 'image/jpeg',
      filename: 'invoice.jpg',
    })

    expect(result.success).toBe(true)
    expect(result.mediaId).toBe('UPLOADED_ID')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/123/media')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer token')
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get('type')).toBe('image/jpeg')
    expect((init.body as FormData).get('messaging_product')).toBe('whatsapp')
  })
})
