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
  | 'reaction'

export type StatusType = 'delivered' | 'failed' | 'read' | 'sent'

export type MessageCategory = 'marketing' | 'utility' | 'authentication' | 'service'

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
  document?: MediaContent & { filename?: string }
  sticker?: MediaContent & { animated?: boolean }
  location?: LocationContent
  reaction?: ReactionContent
  contacts?: ContactContent[]
  context?: MessageContext
}

export interface MessageContext {
  from?: string
  id?: string
}

export interface InteractiveReply {
  type: 'button_reply' | 'list_reply'
  button_reply?: { id: string; title: string }
  list_reply?: { id: string; title: string; description?: string }
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

export interface ReactionContent {
  message_id: string
  emoji: string
}

export interface ContactContent {
  name: {
    formatted_name: string
    first_name?: string
    last_name?: string
  }
  phones?: Array<{ phone: string; type?: string }>
}

export interface StatusUpdate {
  id: string
  status: StatusType
  timestamp: string
  recipient_id: string
  conversation?: ConversationInfo
  pricing?: PricingInfo
  errors?: StatusError[]
}

export interface ConversationInfo {
  id: string
  origin: {
    type: 'user_initiated' | 'business_initiated' | 'referral_conversion'
  }
  expiration_timestamp?: string
}

export interface PricingInfo {
  billable: boolean
  pricing_model: string
  category: MessageCategory
}

export interface StatusError {
  code: number
  title: string
  message?: string
}

// Error context for onError callback
export interface ErrorContext {
  code: number
  message: string
  recipient?: string
  messageType?: string
}

// Client configuration
export interface WhatsAppConfig {
  apiToken: string
  phoneNumberId: string
  apiVersion?: string // defaults to 'v22.0'
  baseUrl?: string // defaults to 'https://graph.facebook.com'
  onError?: (error: ErrorContext) => void | Promise<void>
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

export interface SendImageParams {
  to: string
  image: { link: string } | { id: string }
  caption?: string
}

export interface SendVideoParams {
  to: string
  video: { link: string } | { id: string }
  caption?: string
}

export interface SendAudioParams {
  to: string
  audio: { link: string } | { id: string }
}

export interface SendDocumentParams {
  to: string
  document: { link: string } | { id: string }
  filename?: string
  caption?: string
}

export interface SendStickerParams {
  to: string
  sticker: { link: string } | { id: string }
}

export interface SendLocationParams {
  to: string
  latitude: number
  longitude: number
  name?: string
  address?: string
}

export interface SendReactionParams {
  to: string
  messageId: string
  emoji: string
}

export interface SendContactsParams {
  to: string
  contacts: Array<{
    name: {
      formatted_name: string
      first_name?: string
      last_name?: string
    }
    phones?: Array<{ phone: string; type?: string }>
  }>
}

export interface InteractiveButton {
  type: 'reply'
  reply: {
    id: string
    title: string
  }
}

export interface SendInteractiveButtonsParams {
  to: string
  body: string
  buttons: Array<{ id: string; title: string }>
  header?: { type: 'text'; text: string } | { type: 'image'; image: { link: string } }
  footer?: string
}

export interface SendInteractiveListParams {
  to: string
  body: string
  buttonText: string
  sections: Array<{
    title?: string
    rows: Array<{
      id: string
      title: string
      description?: string
    }>
  }>
  header?: string
  footer?: string
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
