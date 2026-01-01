# @swalha1999/whatsapp-adapter-drizzle

Drizzle ORM adapter for tracking WhatsApp messages in PostgreSQL.

## Features

- Pre-built PostgreSQL schema for message tracking
- Track message delivery status (sent, delivered, read, failed)
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

  sent BOOLEAN DEFAULT FALSE,
  delivered BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  failed BOOLEAN DEFAULT FALSE,

  approved BOOLEAN DEFAULT FALSE,
  declined BOOLEAN DEFAULT FALSE,

  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
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
})

// Returns the created record
{
  id: 1,
  messageId: 'wamid.xxx',
  phone: '1234567890',
  sent: false,
  delivered: false,
  read: false,
  failed: false,
  createdAt: Date,
  ...
}
```

### `adapter.findByMessageId(messageId)`

Find a message by its WhatsApp message ID.

```typescript
const message = await adapter.findByMessageId('wamid.xxx')

if (message) {
  console.log(`Status: ${message.delivered ? 'Delivered' : 'Pending'}`)
}
```

### `adapter.updateStatus(messageId, status)`

Update message delivery status.

```typescript
// Mark as sent
await adapter.updateStatus('wamid.xxx', 'sent')

// Mark as delivered
await adapter.updateStatus('wamid.xxx', 'delivered')

// Mark as read
await adapter.updateStatus('wamid.xxx', 'read')

// Mark as failed
await adapter.updateStatus('wamid.xxx', 'failed')
```

### `adapter.updateResponse(messageId, response)`

Update user response (for RSVP-style templates).

```typescript
// User approved
await adapter.updateResponse('wamid.xxx', 'approved')

// User declined
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
      sent: true,
      sentAt: new Date(),
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

        // Find the original message and update response
        if (payload === 'yes' || payload === 'confirm') {
          // Update based on your tracking logic
        }
      }
    }
  }
}
```

---

## Schema

The `whatsappMessages` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `messageId` | VARCHAR(255) | WhatsApp message ID |
| `contactId` | INTEGER | Optional contact reference |
| `phone` | VARCHAR(20) | Recipient phone number |
| `templateName` | VARCHAR(100) | Template name if used |
| `messageContent` | VARCHAR(1000) | Message content |
| `sent` | BOOLEAN | Message was sent |
| `delivered` | BOOLEAN | Message was delivered |
| `read` | BOOLEAN | Message was read |
| `failed` | BOOLEAN | Message failed |
| `approved` | BOOLEAN | User approved (RSVP) |
| `declined` | BOOLEAN | User declined (RSVP) |
| `sentAt` | TIMESTAMP | When sent |
| `deliveredAt` | TIMESTAMP | When delivered |
| `readAt` | TIMESTAMP | When read |
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

// Insert type (required + optional fields)
const newMessage: NewWhatsAppMessage = {
  messageId: 'wamid.xxx',
  phone: '1234567890',
}
```

---

## License

MIT
