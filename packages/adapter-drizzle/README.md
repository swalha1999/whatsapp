# @swalha1999/whatsapp-adapter-drizzle

Drizzle ORM adapter for tracking WhatsApp messages in PostgreSQL.

## Features

- Pre-built PostgreSQL schema for message tracking
- Track message delivery status using timestamps (null = not happened)
- Track user responses (approved/declined for RSVP-style templates)
- Indexed for fast lookups by message ID, contact ID, or phone number
- Full TypeScript support

## Installation

```bash
# Using pnpm
pnpm add @swalha1999/whatsapp-adapter-drizzle drizzle-orm

# Using npm
npm install @swalha1999/whatsapp-adapter-drizzle drizzle-orm
```

## Quick Start

### 1. Set Up Database

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)
```

### 2. Run Migration

Import the schema and add it to your Drizzle migrations:

```typescript
// drizzle/schema.ts
export { whatsappMessages } from '@swalha1999/whatsapp-adapter-drizzle/schema'
```

Or create the table manually:

```sql
CREATE TABLE whatsapp_messages (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(255),
  contact_id INTEGER,
  phone VARCHAR(20),
  template_name VARCHAR(100),
  message_content VARCHAR(1000),

  -- Status timestamps (null = not happened, set = happened)
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,

  -- Response timestamps
  approved_at TIMESTAMP,
  declined_at TIMESTAMP,

  -- Record timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX message_id_idx ON whatsapp_messages(message_id);
CREATE INDEX contact_id_idx ON whatsapp_messages(contact_id);
CREATE INDEX phone_idx ON whatsapp_messages(phone);
```

### 3. Create Adapter

```typescript
import { createDrizzleAdapter } from '@swalha1999/whatsapp-adapter-drizzle'
import { db } from './db'

const adapter = createDrizzleAdapter(db)
```

## API Reference

### `createDrizzleAdapter(db)`

Creates an adapter instance.

```typescript
import { createDrizzleAdapter } from '@swalha1999/whatsapp-adapter-drizzle'

const adapter = createDrizzleAdapter(db)
```

### `adapter.createMessage(data)`

Create a new message record.

```typescript
const message = await adapter.createMessage({
  messageId: 'wamid.xxx',
  phone: '1234567890',
  contactId: 123,                    // optional
  templateName: 'order_confirmation', // optional
  messageContent: 'Hello!',          // optional
  sentAt: new Date(),                // optional: mark as sent immediately
})

// Returns the created record
{
  id: 1,
  messageId: 'wamid.xxx',
  phone: '1234567890',
  sentAt: Date,        // set = sent
  deliveredAt: null,   // null = not delivered yet
  readAt: null,        // null = not read yet
  failedAt: null,      // null = not failed
  createdAt: Date,
  ...
}
```

### `adapter.findByMessageId(messageId)`

Find a message by its WhatsApp message ID.

```typescript
const message = await adapter.findByMessageId('wamid.xxx')

if (message) {
  // Check status using timestamps
  const isDelivered = message.deliveredAt !== null
  const isRead = message.readAt !== null
  const hasFailed = message.failedAt !== null

  console.log(`Delivered: ${isDelivered}, Read: ${isRead}`)
}
```

### `adapter.updateStatus(messageId, status)`

Update message delivery status. Sets the corresponding timestamp to now.

```typescript
// Mark as sent (sets sentAt)
await adapter.updateStatus('wamid.xxx', 'sent')

// Mark as delivered (sets deliveredAt)
await adapter.updateStatus('wamid.xxx', 'delivered')

// Mark as read (sets readAt)
await adapter.updateStatus('wamid.xxx', 'read')

// Mark as failed (sets failedAt)
await adapter.updateStatus('wamid.xxx', 'failed')
```

### `adapter.updateResponse(messageId, response)`

Update user response. Sets the corresponding timestamp to now.

```typescript
// User approved (sets approvedAt)
await adapter.updateResponse('wamid.xxx', 'approved')

// User declined (sets declinedAt)
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

// Send and track a message
async function sendTrackedMessage(phone: string, body: string) {
  const result = await whatsapp.sendText({ to: phone, body })

  if (result.success) {
    await adapter.createMessage({
      messageId: result.messageId,
      phone,
      messageContent: body,
      sentAt: new Date(), // Mark as sent immediately
    })
  }

  return result
}

// Handle webhook for status updates
async function handleWebhook(payload: any) {
  const events = parseWebhookPayload(payload)

  for (const event of events) {
    if (event.type === 'status' && event.status) {
      const { messageId, status } = event.status
      await adapter.updateStatus(messageId, status)
    }

    if (event.type === 'message' && event.message) {
      const { content } = event.message

      // Handle quick reply responses
      if (content.type === 'interactive' || content.type === 'button') {
        const payload = content.type === 'button'
          ? content.payload
          : content.replyId

        if (payload === 'yes' || payload === 'confirm') {
          await adapter.updateResponse(messageId, 'approved')
        } else if (payload === 'no' || payload === 'cancel') {
          await adapter.updateResponse(messageId, 'declined')
        }
      }
    }
  }
}
```

---

## Schema

The `whatsappMessages` table uses **timestamps as the source of truth**:
- If a timestamp is `null`, the event hasn't happened
- If a timestamp is set, the event happened at that time

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `messageId` | VARCHAR(255) | WhatsApp message ID |
| `contactId` | INTEGER | Optional contact reference |
| `phone` | VARCHAR(20) | Recipient phone number |
| `templateName` | VARCHAR(100) | Template name if used |
| `messageContent` | VARCHAR(1000) | Message content |
| `sentAt` | TIMESTAMP | When message was sent (null = not sent) |
| `deliveredAt` | TIMESTAMP | When delivered (null = not delivered) |
| `readAt` | TIMESTAMP | When read (null = not read) |
| `failedAt` | TIMESTAMP | When failed (null = not failed) |
| `approvedAt` | TIMESTAMP | When user approved (null = not approved) |
| `declinedAt` | TIMESTAMP | When user declined (null = not declined) |
| `createdAt` | TIMESTAMP | Record created |
| `updatedAt` | TIMESTAMP | Record updated |

### Indexes

- `message_id_idx` - Fast lookup by WhatsApp message ID
- `contact_id_idx` - Fast lookup by contact ID
- `phone_idx` - Fast lookup by phone number

---

## Types

```typescript
import type {
  WhatsAppMessage,
  NewWhatsAppMessage
} from '@swalha1999/whatsapp-adapter-drizzle'

// Select type (all fields)
const message: WhatsAppMessage = await adapter.findByMessageId('...')

// Check status via timestamps
if (message.deliveredAt) {
  console.log(`Delivered at: ${message.deliveredAt}`)
}

// Insert type (required + optional fields)
const newMessage: NewWhatsAppMessage = {
  messageId: 'wamid.xxx',
  phone: '1234567890',
  sentAt: new Date(), // optional: mark as sent on creation
}
```

---

## License

MIT
