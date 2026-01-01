// Factory function
export { createWhatsApp } from './create-whatsapp'
export type { WhatsApp } from './create-whatsapp'

// Core types
export type {
  WhatsAppConfig,
  ErrorContext,
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
  MessageType,
  StatusType,
  MessageCategory,
  WebhookPayload,
  IncomingMessage,
  StatusUpdate,
  TemplateComponent,
  TemplateParameter,
  ConversationInfo,
  PricingInfo,
} from './types'

// Error class
export { WhatsAppError } from './client'

// Template builders
export { createTemplateBuilder } from './templates'
export type { TemplateBuilder } from './templates'

// Webhook utilities (also available as separate import)
export { parseWebhookPayload, verifyWebhook, verifyWebhookSignature } from './webhook'
export type {
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  ParsedContact,
  ParsedContactCard,
  MessageContent,
  WebhookVerifyParams,
} from './webhook'

// Batch utility
export { batchSend } from './batch'
export type { BatchOptions, BatchResult } from './batch'
