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
} from './types'

export interface ResolvedConfig extends WhatsAppConfig {
  apiVersion: string
  baseUrl: string
}

function getApiUrl(config: ResolvedConfig): string {
  return `${config.baseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`
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
