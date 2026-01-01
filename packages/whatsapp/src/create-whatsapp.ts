import type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
} from './types'
import { sendText, sendTemplate, markAsRead } from './client'

export interface WhatsApp {
  sendText: (params: SendTextParams) => Promise<SendResult>
  sendTemplate: (params: SendTemplateParams) => Promise<SendResult>
  markAsRead: (messageId: string) => Promise<boolean>
}

export function createWhatsApp(config: WhatsAppConfig): WhatsApp {
  const resolvedConfig = {
    apiVersion: 'v22.0',
    baseUrl: 'https://graph.facebook.com',
    ...config,
  }

  return {
    sendText: (params) => sendText(resolvedConfig, params),
    sendTemplate: (params) => sendTemplate(resolvedConfig, params),
    markAsRead: (messageId) => markAsRead(resolvedConfig, messageId),
  }
}
