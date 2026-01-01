import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { whatsappMessages } from './schema'
import type { WhatsAppMessage, NewWhatsAppMessage } from './schema'

export interface WhatsAppAdapter {
  createMessage(data: NewWhatsAppMessage): Promise<WhatsAppMessage>
  findByMessageId(messageId: string): Promise<WhatsAppMessage | null>
  updateStatus(
    messageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed'
  ): Promise<void>
  updateResponse(
    messageId: string,
    response: 'approved' | 'declined'
  ): Promise<void>
}

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

    async findByMessageId(messageId) {
      const result = await db
        .select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.messageId, messageId))
        .limit(1)
      return result[0] ?? null
    },

    async updateStatus(messageId, status) {
      const updates: Partial<WhatsAppMessage> = {
        [status]: true,
        updatedAt: new Date(),
      }

      if (status === 'sent') updates.sentAt = new Date()
      if (status === 'delivered') updates.deliveredAt = new Date()
      if (status === 'read') updates.readAt = new Date()

      await db
        .update(whatsappMessages)
        .set(updates)
        .where(eq(whatsappMessages.messageId, messageId))
    },

    async updateResponse(messageId, response) {
      await db
        .update(whatsappMessages)
        .set({
          [response]: true,
          updatedAt: new Date(),
        })
        .where(eq(whatsappMessages.messageId, messageId))
    },
  }
}
