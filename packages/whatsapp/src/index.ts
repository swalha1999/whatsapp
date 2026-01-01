// Factory function
export { createWhatsApp } from './create-whatsapp'
export type { WhatsApp } from './create-whatsapp'

// Core types
export type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
  MessageType,
  StatusType,
  WebhookPayload,
  IncomingMessage,
  StatusUpdate,
  TemplateComponent,
  TemplateParameter,
} from './types'

// Error class
export { WhatsAppError } from './client'

// Template builders
export { createTemplateBuilder } from './templates'
export type { TemplateBuilder } from './templates'

// Webhook utilities (also available as separate import)
export { parseWebhookPayload, verifyWebhook } from './webhook'
export type {
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  MessageContent,
  WebhookVerifyParams,
} from './webhook'
