import type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
  SendLocationParams,
  SendReactionParams,
  SendContactsParams,
  SendInteractiveButtonsParams,
  SendInteractiveListParams,
  SendResult,
  ErrorContext,
  DownloadMediaResult,
  UploadMediaParams,
  UploadMediaResult,
} from './types'

export interface ResolvedConfig extends WhatsAppConfig {
  apiVersion: string
  baseUrl: string
}

function getApiUrl(config: ResolvedConfig): string {
  return `${config.baseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`
}

function getMediaUrl(config: ResolvedConfig, mediaId: string): string {
  return `${config.baseUrl}/${config.apiVersion}/${mediaId}`
}

function getMediaUploadUrl(config: ResolvedConfig): string {
  return `${config.baseUrl}/${config.apiVersion}/${config.phoneNumberId}/media`
}

async function makeRequest<T>(config: ResolvedConfig, body: object): Promise<T> {
  const response = await fetch(getApiUrl(config), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new WhatsAppError(
      error.error?.message || 'Unknown error',
      error.error?.code || response.status
    )
  }

  return response.json()
}

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message)
    this.name = 'WhatsAppError'
  }
}

interface SendMessageBody {
  to: string
  type: string
  [key: string]: unknown
}

async function sendMessage(
  config: ResolvedConfig,
  body: SendMessageBody
): Promise<SendResult> {
  try {
    const result = await makeRequest<{ messages: [{ id: string }] }>(config, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...body,
    })

    return {
      messageId: result.messages[0].id,
      success: true,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      const errorContext: ErrorContext = {
        code: error.code,
        message: error.message,
        recipient: body.to,
        messageType: body.type,
      }

      // Call onError callback if provided
      if (config.onError) {
        await Promise.resolve(config.onError(errorContext))
      }

      return {
        messageId: '',
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}

export async function sendText(
  config: ResolvedConfig,
  params: SendTextParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'text',
    text: {
      preview_url: params.previewUrl ?? false,
      body: params.body,
    },
  })
}

export async function sendTemplate(
  config: ResolvedConfig,
  params: SendTemplateParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: params.components,
    },
  })
}

export async function sendImage(
  config: ResolvedConfig,
  params: SendImageParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'image',
    image: {
      ...params.image,
      caption: params.caption,
    },
  })
}

export async function sendVideo(
  config: ResolvedConfig,
  params: SendVideoParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'video',
    video: {
      ...params.video,
      caption: params.caption,
    },
  })
}

export async function sendAudio(
  config: ResolvedConfig,
  params: SendAudioParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'audio',
    audio: params.audio,
  })
}

export async function sendDocument(
  config: ResolvedConfig,
  params: SendDocumentParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'document',
    document: {
      ...params.document,
      filename: params.filename,
      caption: params.caption,
    },
  })
}

export async function sendSticker(
  config: ResolvedConfig,
  params: SendStickerParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'sticker',
    sticker: params.sticker,
  })
}

export async function sendLocation(
  config: ResolvedConfig,
  params: SendLocationParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'location',
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      name: params.name,
      address: params.address,
    },
  })
}

export async function sendReaction(
  config: ResolvedConfig,
  params: SendReactionParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'reaction',
    reaction: {
      message_id: params.messageId,
      emoji: params.emoji,
    },
  })
}

export async function sendContacts(
  config: ResolvedConfig,
  params: SendContactsParams
): Promise<SendResult> {
  return sendMessage(config, {
    to: params.to,
    type: 'contacts',
    contacts: params.contacts,
  })
}

export async function sendInteractiveButtons(
  config: ResolvedConfig,
  params: SendInteractiveButtonsParams
): Promise<SendResult> {
  const interactive: Record<string, unknown> = {
    type: 'button',
    body: { text: params.body },
    action: {
      buttons: params.buttons.map((btn) => ({
        type: 'reply',
        reply: { id: btn.id, title: btn.title },
      })),
    },
  }

  if (params.header) {
    interactive.header = params.header
  }

  if (params.footer) {
    interactive.footer = { text: params.footer }
  }

  return sendMessage(config, {
    to: params.to,
    type: 'interactive',
    interactive,
  })
}

export async function sendInteractiveList(
  config: ResolvedConfig,
  params: SendInteractiveListParams
): Promise<SendResult> {
  const interactive: Record<string, unknown> = {
    type: 'list',
    body: { text: params.body },
    action: {
      button: params.buttonText,
      sections: params.sections,
    },
  }

  if (params.header) {
    interactive.header = { type: 'text', text: params.header }
  }

  if (params.footer) {
    interactive.footer = { text: params.footer }
  }

  return sendMessage(config, {
    to: params.to,
    type: 'interactive',
    interactive,
  })
}

export async function markAsRead(
  config: ResolvedConfig,
  messageId: string
): Promise<boolean> {
  try {
    await makeRequest(config, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    })
    return true
  } catch {
    return false
  }
}

// Download inbound media by id. WhatsApp webhooks only carry a media id, so
// retrieval is two steps: resolve the temporary download URL + metadata, then
// fetch the bytes (both require the bearer token).
export async function downloadMedia(
  config: ResolvedConfig,
  mediaId: string
): Promise<DownloadMediaResult> {
  try {
    const infoResponse = await fetch(getMediaUrl(config, mediaId), {
      headers: { Authorization: `Bearer ${config.apiToken}` },
    })
    if (!infoResponse.ok) {
      const error = await infoResponse.json().catch(() => ({}))
      throw new WhatsAppError(
        error.error?.message || 'Failed to resolve media',
        error.error?.code || infoResponse.status
      )
    }
    const info = (await infoResponse.json()) as {
      url: string
      mime_type: string
      file_size: number
      sha256: string
      id: string
    }

    const mediaResponse = await fetch(info.url, {
      headers: { Authorization: `Bearer ${config.apiToken}` },
    })
    if (!mediaResponse.ok) {
      throw new WhatsAppError(
        `Failed to download media (${mediaResponse.status})`,
        mediaResponse.status
      )
    }
    const data = await mediaResponse.arrayBuffer()

    return {
      success: true,
      data,
      mimeType: info.mime_type,
      fileSize: info.file_size,
      sha256: info.sha256,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      if (config.onError) {
        await Promise.resolve(
          config.onError({ code: error.code, message: error.message })
        )
      }
      return {
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}

// Upload media to WhatsApp and get a reusable media id, which can be sent via
// the { id } variant of sendImage/sendDocument/sendVideo/etc.
export async function uploadMedia(
  config: ResolvedConfig,
  params: UploadMediaParams
): Promise<UploadMediaResult> {
  try {
    const blob =
      params.file instanceof Blob
        ? params.file
        : new Blob([params.file as BlobPart], { type: params.type })

    const form = new FormData()
    form.append('messaging_product', 'whatsapp')
    form.append('type', params.type)
    form.append('file', blob, params.filename ?? 'file')

    const response = await fetch(getMediaUploadUrl(config), {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiToken}` },
      body: form,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new WhatsAppError(
        error.error?.message || 'Failed to upload media',
        error.error?.code || response.status
      )
    }
    const result = (await response.json()) as { id: string }
    return { success: true, mediaId: result.id }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      if (config.onError) {
        await Promise.resolve(
          config.onError({ code: error.code, message: error.message })
        )
      }
      return {
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}
