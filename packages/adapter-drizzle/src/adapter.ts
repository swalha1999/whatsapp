import { eq, desc } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { whatsappMessages } from './schema'
import type { WhatsAppMessage, NewWhatsAppMessage } from './schema'

export type MessageCategory = 'marketing' | 'utility' | 'authentication' | 'service'
export type ConversationOrigin = 'user_initiated' | 'business_initiated' | 'referral_conversion'

export interface SaveOutgoingMessageParams {
  messageId: string
  phone: string
  contactId?: number
  category?: MessageCategory
  messageType?: string
  messageContent?: string
  templateName?: string
  // Media
  mediaId?: string
  mediaUrl?: string
  mediaMimeType?: string
  mediaCaption?: string
  mediaFilename?: string
  // Location
  locationLatitude?: number
  locationLongitude?: number
  locationName?: string
  locationAddress?: string
  // Interactive
  interactiveType?: string
  interactiveData?: string
}

export interface SaveIncomingMessageParams {
  messageId: string
  phone: string
  contactId?: number
  messageType: string
  messageContent?: string
  // Contact info
  contactName?: string
  contactWaId?: string
  // Media
  mediaId?: string
  mediaMimeType?: string
  mediaCaption?: string
  mediaFilename?: string
  // Location
  locationLatitude?: number
  locationLongitude?: number
  locationName?: string
  locationAddress?: string
  // Reply context
  replyToMessageId?: string
  buttonPayload?: string
  // Reaction
  reaction?: string
  reactedToMessageId?: string
  // Sticker
  stickerId?: string
}

export interface WhatsAppAdapter {
  // Create messages
  createMessage(data: NewWhatsAppMessage): Promise<WhatsAppMessage>
  saveOutgoingMessage(params: SaveOutgoingMessageParams): Promise<WhatsAppMessage>
  saveIncomingMessage(params: SaveIncomingMessageParams): Promise<WhatsAppMessage>

  // Find messages
  findByMessageId(messageId: string): Promise<WhatsAppMessage | null>
  findByPhone(phone: string, limit?: number): Promise<WhatsAppMessage[]>
  findConversation(phone: string, limit?: number): Promise<WhatsAppMessage[]>

  // Update status
  updateStatus(
    messageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed'
  ): Promise<void>
  updateResponse(
    messageId: string,
    response: 'approved' | 'declined'
  ): Promise<void>

  // Update error
  updateError(
    messageId: string,
    errorCode: number,
    errorMessage: string
  ): Promise<void>

  // Update conversation info
  updateConversation(
    messageId: string,
    conversationId: string,
    origin: ConversationOrigin,
    expiresAt?: Date
  ): Promise<void>
}

const statusToColumn = {
  sent: 'sentAt',
  delivered: 'deliveredAt',
  read: 'readAt',
  failed: 'failedAt',
} as const

const responseToColumn = {
  approved: 'approvedAt',
  declined: 'declinedAt',
} as const

export function createDrizzleAdapter(
  db: PostgresJsDatabase<Record<string, never>>
): WhatsAppAdapter {
  return {
    async createMessage(data) {
      const [result] = await db
        .insert(whatsappMessages)
        .values(data)
        .returning()
      return result
    },

    async saveOutgoingMessage(params) {
      const [result] = await db
        .insert(whatsappMessages)
        .values({
          messageId: params.messageId,
          phone: params.phone,
          contactId: params.contactId,
          direction: 'outgoing',
          category: params.category,
          messageType: params.messageType ?? 'text',
          messageContent: params.messageContent,
          templateName: params.templateName,
          mediaId: params.mediaId,
          mediaUrl: params.mediaUrl,
          mediaMimeType: params.mediaMimeType,
          mediaCaption: params.mediaCaption,
          mediaFilename: params.mediaFilename,
          locationLatitude: params.locationLatitude,
          locationLongitude: params.locationLongitude,
          locationName: params.locationName,
          locationAddress: params.locationAddress,
          interactiveType: params.interactiveType,
          interactiveData: params.interactiveData,
          sentAt: new Date(),
        })
        .returning()
      return result
    },

    async saveIncomingMessage(params) {
      const [result] = await db
        .insert(whatsappMessages)
        .values({
          messageId: params.messageId,
          phone: params.phone,
          contactId: params.contactId,
          direction: 'incoming',
          messageType: params.messageType,
          messageContent: params.messageContent,
          contactName: params.contactName,
          contactWaId: params.contactWaId,
          mediaId: params.mediaId,
          mediaMimeType: params.mediaMimeType,
          mediaCaption: params.mediaCaption,
          mediaFilename: params.mediaFilename,
          locationLatitude: params.locationLatitude,
          locationLongitude: params.locationLongitude,
          locationName: params.locationName,
          locationAddress: params.locationAddress,
          replyToMessageId: params.replyToMessageId,
          buttonPayload: params.buttonPayload,
          reaction: params.reaction,
          reactedToMessageId: params.reactedToMessageId,
          stickerId: params.stickerId,
          receivedAt: new Date(),
        })
        .returning()
      return result
    },

    async findByMessageId(messageId) {
      const result = await db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.messageId, messageId))
        .limit(1)
      return result[0] ?? null
    },

    async findByPhone(phone, limit = 50) {
      return db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.phone, phone))
        .orderBy(desc(whatsappMessages.createdAt))
        .limit(limit)
    },

    async findConversation(phone, limit = 50) {
      return db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.phone, phone))
        .orderBy(desc(whatsappMessages.createdAt))
        .limit(limit)
    },

    async updateStatus(messageId, status) {
      const column = statusToColumn[status]
      await db
        .update(whatsappMessages)
        .set({
          [column]: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(whatsappMessages.messageId, messageId))
    },

    async updateResponse(messageId, response) {
      const column = responseToColumn[response]
      await db
        .update(whatsappMessages)
        .set({
          [column]: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(whatsappMessages.messageId, messageId))
    },

    async updateError(messageId, errorCode, errorMessage) {
      await db
        .update(whatsappMessages)
        .set({
          errorCode,
          errorMessage,
          failedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(whatsappMessages.messageId, messageId))
    },

    async updateConversation(messageId, conversationId, origin, expiresAt) {
      await db
        .update(whatsappMessages)
        .set({
          conversationId,
          conversationOrigin: origin,
          conversationExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(whatsappMessages.messageId, messageId))
    },
  }
}
