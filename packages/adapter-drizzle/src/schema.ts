import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
  text,
} from 'drizzle-orm/pg-core'

export const whatsappMessages = pgTable(
  'whatsapp_messages',
  {
    id: serial('id').primaryKey(),
    messageId: varchar('message_id', { length: 255 }),
    contactId: integer('contact_id'),
    phone: varchar('phone', { length: 20 }),

    // Message direction: 'incoming' or 'outgoing'
    direction: varchar('direction', { length: 10 }).$type<'incoming' | 'outgoing'>(),

    // Message content
    messageType: varchar('message_type', { length: 20 }), // text, image, audio, video, document, location, button, interactive
    messageContent: text('message_content'),
    mediaId: varchar('media_id', { length: 255 }),
    mediaUrl: varchar('media_url', { length: 1000 }),
    mediaMimeType: varchar('media_mime_type', { length: 100 }),

    // For outgoing template messages
    templateName: varchar('template_name', { length: 100 }),

    // For incoming interactive/button replies
    replyToMessageId: varchar('reply_to_message_id', { length: 255 }),
    buttonPayload: varchar('button_payload', { length: 255 }),

    // Status timestamps for outgoing messages (null = not happened, set = happened)
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    readAt: timestamp('read_at'),
    failedAt: timestamp('failed_at'),

    // Response timestamps (for RSVP-style templates)
    approvedAt: timestamp('approved_at'),
    declinedAt: timestamp('declined_at'),

    // For incoming messages
    receivedAt: timestamp('received_at'),

    // Record timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    messageIdIdx: index('message_id_idx').on(table.messageId),
    contactIdIdx: index('contact_id_idx').on(table.contactId),
    phoneIdx: index('phone_idx').on(table.phone),
    directionIdx: index('direction_idx').on(table.direction),
  })
)

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert
