import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core'

export const whatsappMessages = pgTable(
  'whatsapp_messages',
  {
    id: serial('id').primaryKey(),
    messageId: varchar('message_id', { length: 255 }),
    contactId: integer('contact_id'),
    phone: varchar('phone', { length: 20 }),
    templateName: varchar('template_name', { length: 100 }),
    messageContent: varchar('message_content', { length: 1000 }),

    // Status flags
    sent: boolean('sent').default(false),
    delivered: boolean('delivered').default(false),
    read: boolean('read').default(false),
    failed: boolean('failed').default(false),

    // Response flags (for RSVP-style templates)
    approved: boolean('approved').default(false),
    declined: boolean('declined').default(false),

    // Timestamps
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    messageIdIdx: index('message_id_idx').on(table.messageId),
    contactIdIdx: index('contact_id_idx').on(table.contactId),
    phoneIdx: index('phone_idx').on(table.phone),
  })
)

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert
