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
  contact?: ParsedContact
}

export interface ParsedContact {
  name: string
  waId: string
}

export interface ParsedMessage {
  id: string
  from: string
  timestamp: Date
  type: string
  content: MessageContent
  context?: {
    from?: string
    id?: string
  }
}

export type MessageContent =
  | { type: 'text'; body: string }
  | { type: 'button'; payload: string; text: string }
  | { type: 'interactive'; replyId: string; replyTitle: string; replyDescription?: string }
  | { type: 'media'; mediaType: 'image' | 'video' | 'audio' | 'document'; mediaId: string; mimeType: string; caption?: string; filename?: string }
  | { type: 'location'; latitude: number; longitude: number; name?: string; address?: string }
  | { type: 'sticker'; stickerId: string; mimeType: string; animated?: boolean }
  | { type: 'reaction'; emoji: string; messageId: string }
  | { type: 'contacts'; contacts: ParsedContactCard[] }
  | { type: 'unknown' }

export interface ParsedContactCard {
  formattedName: string
  firstName?: string
  lastName?: string
  phones?: Array<{ phone: string; type?: string }>
}

export interface ParsedStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  recipientId: string
  timestamp: Date
  error?: { code: number; message: string }
  conversation?: {
    id: string
    origin: 'user_initiated' | 'business_initiated' | 'referral_conversion'
    expiresAt?: Date
  }
  pricing?: {
    billable: boolean
    category: string
  }
}
