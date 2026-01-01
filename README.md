# @swalha1999/whatsapp

A TypeScript package for WhatsApp Business API integration.

## Packages

| Package | Description |
|---------|-------------|
| [@swalha1999/whatsapp](./packages/whatsapp) | Core WhatsApp Business API client |
| [@swalha1999/whatsapp-adapter-drizzle](./packages/adapter-drizzle) | Drizzle ORM adapter for message tracking |

## Quick Start

### Installation

```bash
# Using pnpm
pnpm add @swalha1999/whatsapp

# Using npm
npm install @swalha1999/whatsapp

# Using yarn
yarn add @swalha1999/whatsapp
```

### Basic Usage

```typescript
import { createWhatsApp } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

// Send a text message
const result = await whatsapp.sendText({
  to: '1234567890',
  body: 'Hello from WhatsApp!',
})

if (result.success) {
  console.log('Message sent:', result.messageId)
} else {
  console.error('Failed:', result.error)
}
```

### Send Template Messages

```typescript
import { createWhatsApp, createTemplateBuilder } from '@swalha1999/whatsapp'

const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

const result = await whatsapp.sendTemplate({
  to: '1234567890',
  templateName: 'hello_world',
  languageCode: 'en',
  components: createTemplateBuilder()
    .addHeader('image', 'https://example.com/image.jpg')
    .addBodyParam('John')
    .addBodyParam('Order #12345')
    .addQuickReplyButton(0, 'confirm')
    .addQuickReplyButton(1, 'cancel')
    .build(),
})
```

### Handle Webhooks

```typescript
import { parseWebhookPayload, verifyWebhook } from '@swalha1999/whatsapp'

// Verify webhook (GET request)
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

  if (result.valid) {
    return new Response(result.challenge)
  }
  return new Response('Forbidden', { status: 403 })
}

// Handle incoming messages (POST request)
export async function POST(request: Request) {
  const payload = await request.json()
  const events = parseWebhookPayload(payload)

  for (const event of events) {
    if (event.type === 'message' && event.message) {
      const { from, content } = event.message

      if (content.type === 'text') {
        console.log(`Message from ${from}: ${content.body}`)
      }
    }

    if (event.type === 'status' && event.status) {
      console.log(`Message ${event.status.messageId}: ${event.status.status}`)
    }
  }

  return new Response('OK')
}
```

## Configuration

### Environment Variables

```bash
WHATSAPP_TOKEN=your_api_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

### Client Options

```typescript
interface WhatsAppConfig {
  apiToken: string        // Required: Your WhatsApp API token
  phoneNumberId: string   // Required: Your phone number ID
  apiVersion?: string     // Optional: API version (default: 'v22.0')
  baseUrl?: string        // Optional: API base URL (default: 'https://graph.facebook.com')
}
```

## Message Tracking with Drizzle

Track message delivery status using the Drizzle adapter:

```bash
pnpm add @swalha1999/whatsapp-adapter-drizzle drizzle-orm
```

```typescript
import { createDrizzleAdapter } from '@swalha1999/whatsapp-adapter-drizzle'
import { whatsappMessages } from '@swalha1999/whatsapp-adapter-drizzle/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

const adapter = createDrizzleAdapter(db)

// Create a message record
const message = await adapter.createMessage({
  messageId: result.messageId,
  phone: '1234567890',
  templateName: 'hello_world',
})

// Update status from webhook
await adapter.updateStatus(messageId, 'delivered')
await adapter.updateStatus(messageId, 'read')
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking
pnpm typecheck

# Run tests
pnpm test
```

## License

MIT
