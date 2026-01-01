export interface WebhookVerifyParams {
  mode: string
  token: string
  challenge: string
}

export interface ParsedWebhook {
  type: 'message' | 'status' | 'unknown'
  phoneNumberId: string
  message?: ParsedMessage
  status?: ParsedStatus
}

export interface ParsedMessage {
  id: string
  from: string
  timestamp: Date
  type: string
  content: MessageContent
}

export type MessageContent =
  | { type: 'text'; body: string }
  | { type: 'button'; payload: string; text: string }
  | { type: 'interactive'; replyId: string; replyTitle: string }
  | { type: 'media'; mediaId: string; mimeType: string; caption?: string }
  | { type: 'location'; latitude: number; longitude: number }
  | { type: 'unknown' }

export interface ParsedStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  recipientId: string
  timestamp: Date
  error?: { code: number; message: string }
}
