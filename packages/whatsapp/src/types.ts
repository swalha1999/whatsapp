// Message types
export type MessageType =
  | 'audio'
  | 'button'
  | 'document'
  | 'text'
  | 'image'
  | 'interactive'
  | 'order'
  | 'sticker'
  | 'system'
  | 'video'
  | 'location'
  | 'contacts'

export type StatusType = 'delivered' | 'failed' | 'read' | 'sent'

// Webhook payload structure
export interface WebhookPayload {
  object: string
  entry: Entry[]
}

export interface Entry {
  id: string
  changes: Change[]
}

export interface Change {
  value: ChangeValue
  field: string
}

export interface ChangeValue {
  messaging_product: string
  metadata: Metadata
  contacts?: Contact[]
  messages?: IncomingMessage[]
  statuses?: StatusUpdate[]
}

export interface Metadata {
  display_phone_number: string
  phone_number_id: string
}

export interface Contact {
  profile: { name: string }
  wa_id: string
}

export interface IncomingMessage {
  from: string
  id: string
  timestamp: string
  type: MessageType
  text?: { body: string }
  button?: { payload: string; text: string }
  interactive?: InteractiveReply
  image?: MediaContent
  audio?: MediaContent
  video?: MediaContent
  document?: MediaContent
  location?: LocationContent
}

export interface InteractiveReply {
  type: 'button_reply' | 'list_reply'
  button_reply?: { id: string; title: string }
  list_reply?: { id: string; title: string }
}

export interface MediaContent {
  id: string
  mime_type: string
  sha256?: string
  caption?: string
}

export interface LocationContent {
  latitude: number
  longitude: number
  name?: string
  address?: string
}

export interface StatusUpdate {
  id: string
  status: StatusType
  timestamp: string
  recipient_id: string
  errors?: StatusError[]
}

export interface StatusError {
  code: number
  title: string
  message?: string
}

// Client configuration
export interface WhatsAppConfig {
  apiToken: string
  phoneNumberId: string
  apiVersion?: string // defaults to 'v22.0'
  baseUrl?: string // defaults to 'https://graph.facebook.com'
}

// Send message types
export interface SendTextParams {
  to: string
  body: string
  previewUrl?: boolean
}

export interface SendTemplateParams {
  to: string
  templateName: string
  languageCode: string
  components?: TemplateComponent[]
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters?: TemplateParameter[]
  sub_type?: 'quick_reply' | 'url'
  index?: number
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video'
  text?: string
  image?: { link: string }
  document?: { link: string; filename?: string }
  video?: { link: string }
}

export interface SendResult {
  messageId: string
  success: boolean
  error?: {
    code: number
    message: string
  }
}
