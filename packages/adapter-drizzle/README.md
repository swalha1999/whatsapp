# @swalha1999/whatsapp-adapter-drizzle

Drizzle ORM adapter for tracking WhatsApp messages in PostgreSQL.

## Features

- Track both **incoming** and **outgoing** messages
- Store message content, media, and metadata
- Track delivery status using timestamps (null = not happened)
- Track user responses (approved/declined for RSVP-style templates)
- Query conversation history by phone number
- Full TypeScript support

## Installation

```bash
pnpm add @swalha1999/whatsapp-adapter-drizzle drizzle-orm
```

## Quick Start

### 1. Set Up Database

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)
```

### 2. Add Schema to Your Project

**Copy the schema into your Drizzle schema file:**

```typescript
// drizzle/schema.ts (or your schema file)
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
```

Then run your Drizzle migration:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 3. Create Adapter

```typescript
import { createDrizzleAdapter } from '@swalha1999/whatsapp-adapter-drizzle'
import { db } from './db'

const adapter = createDrizzleAdapter(db)
```

---

## API Reference

### `adapter.saveOutgoingMessage(params)`

Save an outgoing message (message you sent).

```typescript
const message = await adapter.saveOutgoingMessage({
  messageId: 'wamid.xxx',
  phone: '1234567890',
  messageContent: 'Hello!',
  messageType: 'text',              // optional, defaults to 'text'
  contactId: 123,                   // optional
  templateName: 'order_update',     // optional, for template messages
  mediaId: 'media_id',              // optional, for media messages
  mediaUrl: 'https://...',          // optional
  mediaMimeType: 'image/jpeg',      // optional
})

// Returns: { direction: 'outgoing', sentAt: Date, ... }
```

### `adapter.saveIncomingMessage(params)`

Save an incoming message (message you received).

```typescript
const message = await adapter.saveIncomingMessage({
  messageId: 'wamid.xxx',
  phone: '1234567890',
  messageType: 'text',
  messageContent: 'Hi there!',
  contactId: 123,                   // optional
  mediaId: 'media_id',              // optional
  mediaMimeType: 'image/jpeg',      // optional
  replyToMessageId: 'wamid.yyy',    // optional, if replying to a message
  buttonPayload: 'confirm',         // optional, for button/interactive replies
})

// Returns: { direction: 'incoming', receivedAt: Date, ... }
```

### `adapter.findByMessageId(messageId)`

Find a message by its WhatsApp message ID.

```typescript
const message = await adapter.findByMessageId('wamid.xxx')

if (message) {
  console.log(`Direction: ${message.direction}`)
  console.log(`Content: ${message.messageContent}`)
}
```

### `adapter.findConversation(phone, limit?)`

Get conversation history with a phone number (both incoming and outgoing).

```typescript
const messages = await adapter.findConversation('1234567890', 50)

for (const msg of messages) {
  const prefix = msg.direction === 'incoming' ? '←' : '→'
  console.log(`${prefix} ${msg.messageContent}`)
}
```

### `adapter.updateStatus(messageId, status)`

Update delivery status for outgoing messages.

```typescript
await adapter.updateStatus('wamid.xxx', 'delivered')
await adapter.updateStatus('wamid.xxx', 'read')
await adapter.updateStatus('wamid.xxx', 'failed')
```

### `adapter.updateResponse(messageId, response)`

Update user response for RSVP-style messages.

```typescript
await adapter.updateResponse('wamid.xxx', 'approved')
await adapter.updateResponse('wamid.xxx', 'declined')
```

---

## Full Example

```typescript
import { createWhatsApp, parseWebhookPayload } from '@swalha1999/whatsapp'
import { createDrizzleAdapter } from '@swalha1999/whatsapp-adapter-drizzle'
import { db } from './db'

const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

const adapter = createDrizzleAdapter(db)

// Send and track an outgoing message
async function sendMessage(phone: string, body: string) {
  const result = await whatsapp.sendText({ to: phone, body })

  if (result.success) {
    await adapter.saveOutgoingMessage({
      messageId: result.messageId,
      phone,
      messageType: 'text',
      messageContent: body,
    })
  }

  return result
}

// Handle webhook for incoming messages and status updates
async function handleWebhook(payload: any) {
  const events = parseWebhookPayload(payload)

  for (const event of events) {
    // Save incoming messages
    if (event.type === 'message' && event.message) {
      const { id, from, content } = event.message

      await adapter.saveIncomingMessage({
        messageId: id,
        phone: from,
        messageType: content.type,
        messageContent: content.type === 'text' ? content.body : undefined,
        mediaId: content.type === 'media' ? content.mediaId : undefined,
        mediaMimeType: content.type === 'media' ? content.mimeType : undefined,
        buttonPayload: content.type === 'button' ? content.payload :
                       content.type === 'interactive' ? content.replyId : undefined,
      })

      // Handle RSVP responses
      if (content.type === 'button' || content.type === 'interactive') {
        const payload = content.type === 'button' ? content.payload : content.replyId

        if (payload === 'yes' || payload === 'confirm') {
          // Find the original outgoing message and mark as approved
          // (implement your own logic to link responses to original messages)
        }
      }
    }

    // Update delivery status for outgoing messages
    if (event.type === 'status' && event.status) {
      await adapter.updateStatus(event.status.messageId, event.status.status)
    }
  }
}

// Get conversation history
async function getConversation(phone: string) {
  const messages = await adapter.findConversation(phone, 100)

  return messages.map(msg => ({
    direction: msg.direction,
    content: msg.messageContent,
    timestamp: msg.direction === 'incoming' ? msg.receivedAt : msg.sentAt,
  }))
}
```

---

## Schema Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `messageId` | VARCHAR(255) | WhatsApp message ID |
| `contactId` | INTEGER | Optional contact reference |
| `phone` | VARCHAR(20) | Phone number |
| `direction` | VARCHAR(10) | `'incoming'` or `'outgoing'` |
| `messageType` | VARCHAR(20) | text, image, audio, video, etc. |
| `messageContent` | TEXT | Message text content |
| `mediaId` | VARCHAR(255) | WhatsApp media ID |
| `mediaUrl` | VARCHAR(1000) | Media URL (for outgoing) |
| `mediaMimeType` | VARCHAR(100) | Media MIME type |
| `templateName` | VARCHAR(100) | Template name (outgoing) |
| `replyToMessageId` | VARCHAR(255) | Original message ID (for replies) |
| `buttonPayload` | VARCHAR(255) | Button/interactive payload |
| `sentAt` | TIMESTAMP | When sent (outgoing) |
| `deliveredAt` | TIMESTAMP | When delivered (outgoing) |
| `readAt` | TIMESTAMP | When read (outgoing) |
| `failedAt` | TIMESTAMP | When failed (outgoing) |
| `approvedAt` | TIMESTAMP | When approved (RSVP) |
| `declinedAt` | TIMESTAMP | When declined (RSVP) |
| `receivedAt` | TIMESTAMP | When received (incoming) |
| `createdAt` | TIMESTAMP | Record created |
| `updatedAt` | TIMESTAMP | Record updated |

### Indexes

- `message_id_idx` - Fast lookup by WhatsApp message ID
- `contact_id_idx` - Fast lookup by contact ID
- `phone_idx` - Fast lookup by phone number
- `direction_idx` - Filter by incoming/outgoing

---

## License

MIT
