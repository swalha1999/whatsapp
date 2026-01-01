# @swalha1999/whatsapp

A lightweight, type-safe WhatsApp Business API client for Node.js.

## Features

- Send text messages and template messages
- Send media: images, videos, audio, documents, stickers
- Send interactive messages: buttons, lists
- Send location, reactions, and contact cards
- Message categories: marketing, utility, authentication, service
- Parse incoming webhook payloads (text, media, location, reactions, stickers, contacts)
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

### `whatsapp.sendImage(params)`

Send an image message.

```typescript
const result = await whatsapp.sendImage({
  to: '1234567890',
  image: { link: 'https://example.com/image.jpg' },
  // Or use media ID: image: { id: 'media_id' },
  caption: 'Check this out!',  // optional
})
```

### `whatsapp.sendVideo(params)`

Send a video message.

```typescript
const result = await whatsapp.sendVideo({
  to: '1234567890',
  video: { link: 'https://example.com/video.mp4' },
  caption: 'Watch this!',  // optional
})
```

### `whatsapp.sendAudio(params)`

Send an audio message.

```typescript
const result = await whatsapp.sendAudio({
  to: '1234567890',
  audio: { link: 'https://example.com/audio.mp3' },
})
```

### `whatsapp.sendDocument(params)`

Send a document.

```typescript
const result = await whatsapp.sendDocument({
  to: '1234567890',
  document: { link: 'https://example.com/file.pdf' },
  filename: 'report.pdf',  // optional
  caption: 'Here is the report',  // optional
})
```

### `whatsapp.sendSticker(params)`

Send a sticker.

```typescript
const result = await whatsapp.sendSticker({
  to: '1234567890',
  sticker: { id: 'sticker_media_id' },
})
```

### `whatsapp.sendLocation(params)`

Send a location.

```typescript
const result = await whatsapp.sendLocation({
  to: '1234567890',
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco',  // optional
  address: '123 Main St, San Francisco, CA',  // optional
})
```

### `whatsapp.sendReaction(params)`

Send a reaction to a message.

```typescript
const result = await whatsapp.sendReaction({
  to: '1234567890',
  messageId: 'wamid.xxx',
  emoji: '👍',
})
```

### `whatsapp.sendContacts(params)`

Send contact cards.

```typescript
const result = await whatsapp.sendContacts({
  to: '1234567890',
  contacts: [
    {
      name: { formatted_name: 'John Doe', first_name: 'John', last_name: 'Doe' },
      phones: [{ phone: '+1234567890', type: 'CELL' }],
    },
  ],
})
```

### `whatsapp.sendInteractiveButtons(params)`

Send an interactive button message.

```typescript
const result = await whatsapp.sendInteractiveButtons({
  to: '1234567890',
  body: 'Please choose an option:',
  buttons: [
    { id: 'yes', title: 'Yes' },
    { id: 'no', title: 'No' },
    { id: 'maybe', title: 'Maybe' },
  ],
  header: 'Confirmation',  // optional
  footer: 'Reply within 24 hours',  // optional
})
```

### `whatsapp.sendInteractiveList(params)`

Send an interactive list message.

```typescript
const result = await whatsapp.sendInteractiveList({
  to: '1234567890',
  body: 'Select a product:',
  buttonText: 'View Products',
  sections: [
    {
      title: 'Electronics',
      rows: [
        { id: 'phone', title: 'Smartphone', description: 'Latest model' },
        { id: 'laptop', title: 'Laptop', description: 'High performance' },
      ],
    },
    {
      title: 'Accessories',
      rows: [
        { id: 'case', title: 'Phone Case' },
        { id: 'charger', title: 'Fast Charger' },
      ],
    },
  ],
  header: 'Our Products',  // optional
  footer: 'Prices may vary',  // optional
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
| `addUrlButton(index, dynamicSuffix)` | Add URL button with dynamic suffix |
| `build()` | Build and return components array |

### URL Buttons Example

For templates with URL buttons that have dynamic suffixes:

```typescript
const components = createTemplateBuilder()
  .addHeader('image', 'https://example.com/image.jpg')
  .addBodyParam('John')
  .addQuickReplyButton(0, 'rsvp_yes')
  .addUrlButton(1, 'https://instagram.com/user')
  .build()
```

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

### Verify Webhook Signature (HMAC-SHA256)

For enhanced security, verify the webhook signature using your app secret:

```typescript
import { verifyWebhookSignature, parseWebhookPayload } from '@swalha1999/whatsapp'

export async function POST(request: Request) {
  const signature = request.headers.get('x-hub-signature-256') || ''
  const rawBody = await request.text()

  if (!verifyWebhookSignature(rawBody, signature, process.env.APP_SECRET!)) {
    return new Response('Invalid signature', { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const events = parseWebhookPayload(payload)
  // ... handle events
}
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

        case 'sticker':
          console.log(`Sticker: ${content.stickerId}`)
          break

        case 'reaction':
          console.log(`Reaction: ${content.emoji} to ${content.messageId}`)
          break

        case 'contacts':
          console.log(`Contacts: ${content.contacts.map(c => c.formattedName).join(', ')}`)
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
  | { type: 'interactive'; replyId: string; replyTitle: string; replyDescription?: string }
  | { type: 'media'; mediaType: 'image' | 'video' | 'audio' | 'document'; mediaId: string; mimeType: string; caption?: string; filename?: string }
  | { type: 'location'; latitude: number; longitude: number; name?: string; address?: string }
  | { type: 'sticker'; stickerId: string; mimeType: string; animated?: boolean }
  | { type: 'reaction'; emoji: string; messageId: string }
  | { type: 'contacts'; contacts: ParsedContactCard[] }
  | { type: 'unknown' }

interface ParsedContactCard {
  formattedName: string
  firstName?: string
  lastName?: string
  phones?: Array<{ phone: string; type?: string }>
}
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
  contact?: ParsedContact  // Contact info for incoming messages
}

interface ParsedContact {
  name: string    // Profile name
  waId: string    // WhatsApp ID
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
  conversation?: {
    id: string
    origin: 'user_initiated' | 'business_initiated' | 'referral_conversion'
    expiresAt?: Date
  }
  pricing?: {
    billable: boolean
    category: string
  }
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

## Batch Sending

Send messages in batches with automatic delays to avoid rate limits:

```typescript
import { createWhatsApp, batchSend, createTemplateBuilder } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

const contacts = [
  { phone: '1234567890', name: 'John' },
  { phone: '0987654321', name: 'Jane' },
  // ... more contacts
]

const result = await batchSend(
  contacts,
  (contact) => whatsapp.sendTemplate({
    to: contact.phone,
    templateName: 'invitation',
    languageCode: 'en',
    components: createTemplateBuilder().addBodyParam(contact.name).build(),
  }),
  {
    batchSize: 70,           // Send 70 messages per batch (default: 50)
    delayMs: 1000,           // Wait 1 second between batches (default: 1000)
    onProgress: (done, total) => console.log(`Progress: ${done}/${total}`),
    onError: (error, contact, index) => console.error(`Failed for ${contact.phone}`),
  }
)

console.log(`Sent ${result.successful}/${result.total} messages`)
console.log(`Failed: ${result.failed}`)
```

### BatchResult

```typescript
interface BatchResult {
  total: number        // Total items processed
  successful: number   // Successfully sent
  failed: number       // Failed to send
  results: SendResult[]  // All results
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
