import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
  text,
  real,
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

    // Message category for business purposes
    category: varchar('category', { length: 20 }).$type<'marketing' | 'utility' | 'authentication' | 'service'>(),

    // Message content
    messageType: varchar('message_type', { length: 20 }), // text, image, audio, video, document, location, button, interactive, sticker, reaction, contacts
    messageContent: text('message_content'),

    // Media fields
    mediaId: varchar('media_id', { length: 255 }),
    mediaUrl: varchar('media_url', { length: 1000 }),
    mediaMimeType: varchar('media_mime_type', { length: 100 }),
    mediaCaption: text('media_caption'),
    mediaFilename: varchar('media_filename', { length: 255 }),

    // For outgoing template messages
    templateName: varchar('template_name', { length: 100 }),

    // Contact info (from incoming messages)
    contactName: varchar('contact_name', { length: 255 }),
    contactWaId: varchar('contact_wa_id', { length: 20 }),

    // Location details
    locationLatitude: real('location_latitude'),
    locationLongitude: real('location_longitude'),
    locationName: varchar('location_name', { length: 255 }),
    locationAddress: text('location_address'),

    // Interactive message details (for outgoing)
    interactiveType: varchar('interactive_type', { length: 20 }), // button, list, product, product_list
    interactiveData: text('interactive_data'), // JSON for buttons/list items

    // For incoming interactive/button replies
    replyToMessageId: varchar('reply_to_message_id', { length: 255 }),
    buttonPayload: varchar('button_payload', { length: 255 }),

    // Reaction
    reaction: varchar('reaction', { length: 10 }),
    reactedToMessageId: varchar('reacted_to_message_id', { length: 255 }),

    // Sticker
    stickerId: varchar('sticker_id', { length: 255 }),

    // Error tracking
    errorCode: integer('error_code'),
    errorMessage: text('error_message'),

    // Conversation tracking (from status webhooks)
    conversationId: varchar('conversation_id', { length: 255 }),
    conversationOrigin: varchar('conversation_origin', { length: 30 }).$type<'user_initiated' | 'business_initiated' | 'referral_conversion'>(),
    conversationExpiresAt: timestamp('conversation_expires_at'),

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
    categoryIdx: index('category_idx').on(table.category),
    conversationIdIdx: index('conversation_id_idx').on(table.conversationId),
  })
)

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert
