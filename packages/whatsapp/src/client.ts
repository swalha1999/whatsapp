import type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
} from './types'

interface ResolvedConfig extends WhatsAppConfig {
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

export async function sendText(
  config: ResolvedConfig,
  params: SendTextParams
): Promise<SendResult> {
  try {
    const result = await makeRequest<{ messages: [{ id: string }] }>(config, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        preview_url: params.previewUrl ?? false,
        body: params.body,
      },
    })

    return {
      messageId: result.messages[0].id,
      success: true,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      return {
        messageId: '',
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}

export async function sendTemplate(
  config: ResolvedConfig,
  params: SendTemplateParams
): Promise<SendResult> {
  try {
    const result = await makeRequest<{ messages: [{ id: string }] }>(config, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.languageCode },
        components: params.components,
      },
    })

    return {
      messageId: result.messages[0].id,
      success: true,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      return {
        messageId: '',
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
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
