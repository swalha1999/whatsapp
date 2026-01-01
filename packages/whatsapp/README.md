# @swalha1999/whatsapp

A lightweight, type-safe WhatsApp Business API client for Node.js.

## Features

- Send text messages and template messages
- Parse incoming webhook payloads
- Verify webhook subscriptions
- Fluent template builder API
- Full TypeScript support
- Zero dependencies (uses native fetch)

## Installation

```bash
# Using pnpm
pnpm add @swalha1999/whatsapp

# Using npm
npm install @swalha1999/whatsapp

# Using yarn
yarn add @swalha1999/whatsapp
```

## Quick Start

```typescript
import { createWhatsApp } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

// Send a message
const result = await whatsapp.sendText({
  to: '1234567890',
  body: 'Hello!',
})

console.log(result.success ? 'Sent!' : result.error?.message)
```

## API Reference

### `createWhatsApp(config)`

Creates a WhatsApp client instance.

```typescript
import { createWhatsApp } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({
  apiToken: 'your_token',
  phoneNumberId: 'your_phone_id',
  apiVersion: 'v22.0',      // optional, default: 'v22.0'
  baseUrl: 'https://...',   // optional, default: 'https://graph.facebook.com'
})
```

### `whatsapp.sendText(params)`

Send a text message.

```typescript
const result = await whatsapp.sendText({
  to: '1234567890',        // recipient phone number
  body: 'Hello!',          // message text
  previewUrl: true,        // optional: enable URL preview
})

// Result
{
  success: true,
  messageId: 'wamid.xxx'
}

// Or on error
{
  success: false,
  messageId: '',
  error: { code: 131047, message: 'Re-engagement message' }
}
```

### `whatsapp.sendTemplate(params)`

Send a template message.

```typescript
const result = await whatsapp.sendTemplate({
  to: '1234567890',
  templateName: 'order_confirmation',
  languageCode: 'en',
  components: [
    {
      type: 'header',
      parameters: [{ type: 'image', image: { link: 'https://...' } }]
    },
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John' },
        { type: 'text', text: 'Order #123' }
      ]
    }
  ]
})
```

### `whatsapp.markAsRead(messageId)`

Mark a message as read.

```typescript
const success = await whatsapp.markAsRead('wamid.xxx')
```

---

## Template Builder

Use the fluent builder API to construct template components easily:

```typescript
import { createTemplateBuilder } from '@swalha1999/whatsapp'

const components = createTemplateBuilder()
  // Add header with media
  .addHeader('image', 'https://example.com/image.jpg')
  // Or text header
  // .addTextHeader('Welcome!')

  // Add body parameters ({{1}}, {{2}}, etc.)
  .addBodyParam('John Doe')
  .addBodyParam('Order #12345')
  .addBodyParam('$99.99')

  // Add quick reply buttons
  .addQuickReplyButton(0, 'confirm_payload')
  .addQuickReplyButton(1, 'cancel_payload')

  .build()

await whatsapp.sendTemplate({
  to: '1234567890',
  templateName: 'order_update',
  languageCode: 'en',
  components,
})
```

### Builder Methods

| Method | Description |
|--------|-------------|
| `addHeader(type, url)` | Add media header (image, video, document) |
| `addTextHeader(text)` | Add text header |
| `addBodyParam(text)` | Add body parameter |
| `addQuickReplyButton(index, payload)` | Add quick reply button |
| `build()` | Build and return components array |

---

## Webhook Handling

### Verify Webhook Subscription

```typescript
import { verifyWebhook } from '@swalha1999/whatsapp'

// Express example
app.get('/webhook', (req, res) => {
  const result = verifyWebhook(
    {
      mode: req.query['hub.mode'],
      token: req.query['hub.verify_token'],
      challenge: req.query['hub.challenge'],
    },
    process.env.VERIFY_TOKEN!
  )

  if (result.valid) {
    res.send(result.challenge)
  } else {
    res.sendStatus(403)
  }
})
```

### Parse Incoming Messages

```typescript
import { parseWebhookPayload } from '@swalha1999/whatsapp'

app.post('/webhook', (req, res) => {
  const events = parseWebhookPayload(req.body)

  for (const event of events) {
    // Handle incoming messages
    if (event.type === 'message' && event.message) {
      const { id, from, timestamp, content } = event.message

      switch (content.type) {
        case 'text':
          console.log(`Text from ${from}: ${content.body}`)
          break

        case 'button':
          console.log(`Button clicked: ${content.payload}`)
          break

        case 'interactive':
          console.log(`Reply: ${content.replyId} - ${content.replyTitle}`)
          break

        case 'media':
          console.log(`Media: ${content.mediaId} (${content.mimeType})`)
          break

        case 'location':
          console.log(`Location: ${content.latitude}, ${content.longitude}`)
          break
      }
    }

    // Handle status updates
    if (event.type === 'status' && event.status) {
      const { messageId, status, recipientId, error } = event.status
      console.log(`Message ${messageId} is now ${status}`)

      if (error) {
        console.error(`Error: ${error.code} - ${error.message}`)
      }
    }
  }

  res.sendStatus(200)
})
```

---

## Types

### Message Content Types

```typescript
type MessageContent =
  | { type: 'text'; body: string }
  | { type: 'button'; payload: string; text: string }
  | { type: 'interactive'; replyId: string; replyTitle: string }
  | { type: 'media'; mediaId: string; mimeType: string; caption?: string }
  | { type: 'location'; latitude: number; longitude: number }
  | { type: 'unknown' }
```

### Status Types

```typescript
type StatusType = 'sent' | 'delivered' | 'read' | 'failed'
```

### Parsed Webhook

```typescript
interface ParsedWebhook {
  type: 'message' | 'status' | 'unknown'
  phoneNumberId: string
  message?: ParsedMessage
  status?: ParsedStatus
}

interface ParsedMessage {
  id: string
  from: string
  timestamp: Date
  type: string
  content: MessageContent
}

interface ParsedStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  recipientId: string
  timestamp: Date
  error?: { code: number; message: string }
}
```

---

## Error Handling

```typescript
import { createWhatsApp, WhatsAppError } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({ ... })

const result = await whatsapp.sendText({
  to: '1234567890',
  body: 'Hello!',
})

if (!result.success) {
  console.error(`Error ${result.error?.code}: ${result.error?.message}`)

  // Common error codes:
  // 131047 - Re-engagement message required (24h window expired)
  // 131051 - Invalid recipient
  // 132000 - Template not found
  // 100    - Invalid parameter
}
```

---

## Next.js App Router Example

```typescript
// app/api/whatsapp/webhook/route.ts
import { parseWebhookPayload, verifyWebhook } from '@swalha1999/whatsapp'

export async function GET(request: Request) {
  const url = new URL(request.url)

  const result = verifyWebhook(
    {
      mode: url.searchParams.get('hub.mode') || '',
      token: url.searchParams.get('hub.verify_token') || '',
      challenge: url.searchParams.get('hub.challenge') || '',
    },
    process.env.WHATSAPP_VERIFY_TOKEN!
  )

  return result.valid
    ? new Response(result.challenge)
    : new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const payload = await request.json()
  const events = parseWebhookPayload(payload)

  for (const event of events) {
    if (event.type === 'message') {
      // Handle message
    }
  }

  return new Response('OK')
}
```

---

## License

MIT
