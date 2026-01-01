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
} from './types'
import {
  sendText,
  sendTemplate,
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
  sendLocation,
  sendReaction,
  sendContacts,
  sendInteractiveButtons,
  sendInteractiveList,
  markAsRead,
} from './client'

export interface WhatsApp {
  // Text & Templates
  sendText: (params: SendTextParams) => Promise<SendResult>
  sendTemplate: (params: SendTemplateParams) => Promise<SendResult>

  // Media
  sendImage: (params: SendImageParams) => Promise<SendResult>
  sendVideo: (params: SendVideoParams) => Promise<SendResult>
  sendAudio: (params: SendAudioParams) => Promise<SendResult>
  sendDocument: (params: SendDocumentParams) => Promise<SendResult>
  sendSticker: (params: SendStickerParams) => Promise<SendResult>

  // Location & Contacts
  sendLocation: (params: SendLocationParams) => Promise<SendResult>
  sendContacts: (params: SendContactsParams) => Promise<SendResult>

  // Interactive
  sendInteractiveButtons: (params: SendInteractiveButtonsParams) => Promise<SendResult>
  sendInteractiveList: (params: SendInteractiveListParams) => Promise<SendResult>

  // Reactions
  sendReaction: (params: SendReactionParams) => Promise<SendResult>

  // Utilities
  markAsRead: (messageId: string) => Promise<boolean>
}

export function createWhatsApp(config: WhatsAppConfig): WhatsApp {
  const resolvedConfig = {
    apiVersion: 'v22.0',
    baseUrl: 'https://graph.facebook.com',
    ...config,
  }

  return {
    // Text & Templates
    sendText: (params) => sendText(resolvedConfig, params),
    sendTemplate: (params) => sendTemplate(resolvedConfig, params),

    // Media
    sendImage: (params) => sendImage(resolvedConfig, params),
    sendVideo: (params) => sendVideo(resolvedConfig, params),
    sendAudio: (params) => sendAudio(resolvedConfig, params),
    sendDocument: (params) => sendDocument(resolvedConfig, params),
    sendSticker: (params) => sendSticker(resolvedConfig, params),

    // Location & Contacts
    sendLocation: (params) => sendLocation(resolvedConfig, params),
    sendContacts: (params) => sendContacts(resolvedConfig, params),

    // Interactive
    sendInteractiveButtons: (params) => sendInteractiveButtons(resolvedConfig, params),
    sendInteractiveList: (params) => sendInteractiveList(resolvedConfig, params),

    // Reactions
    sendReaction: (params) => sendReaction(resolvedConfig, params),

    // Utilities
    markAsRead: (messageId) => markAsRead(resolvedConfig, messageId),
  }
}
