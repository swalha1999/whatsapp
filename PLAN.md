# @swalha1999/whatsapp Package Implementation Plan

## Overview

A TypeScript package for WhatsApp Business API integration, following the same patterns and conventions as `@swalha1999/translate`.

## Repository Structure

```
/Users/swalha/code/whatsapp/
├── packages/
│   ├── whatsapp/                    # Core package @swalha1999/whatsapp
│   │   ├── src/
│   │   │   ├── index.ts             # Main exports
│   │   │   ├── types.ts             # Core type definitions
│   │   │   ├── create-whatsapp.ts   # Factory function
│   │   │   ├── client.ts            # WhatsApp API client
│   │   │   ├── utils.ts             # Utility functions
│   │   │   ├── templates/           # Message template builders
│   │   │   │   ├── index.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── builders.ts
│   │   │   ├── webhook/             # Webhook handling
│   │   │   │   ├── index.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── parser.ts
│   │   │   │   └── verify.ts
│   │   │   └── __tests__/
│   │   │       ├── client.test.ts
│   │   │       ├── templates.test.ts
│   │   │       └── webhook.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsdown.config.ts
│   │   ├── vitest.config.ts
│   │   └── README.md
│   │
│   └── adapter-drizzle/             # Optional: Drizzle adapter for message tracking
│       ├── src/
│       │   ├── index.ts
│       │   ├── types.ts
│       │   ├── schema.ts            # Drizzle schema for whatsapp_messages
│       │   └── adapter.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsdown.config.ts
│       └── README.md
│
├── examples/
│   └── basic/                       # Usage example
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json                    # Base tsconfig
├── .gitignore
├── .npmrc
├── LICENSE
└── README.md
```

---

## Phase 1: Repository Setup

### Step 1.1: Initialize Repository
```bash
mkdir -p /Users/swalha/code/whatsapp
cd /Users/swalha/code/whatsapp
git init
```

### Step 1.2: Create Root Configuration Files

**package.json** (root):
```json
{
  "name": "swalha1999-whatsapp",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
  - 'examples/*'
```

**turbo.json**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**.gitignore**:
```
node_modules/
dist/
.turbo/
*.log
.env
.env.local
```

---

## Phase 2: Core Package (@swalha1999/whatsapp)

### Step 2.1: Package Configuration

**packages/whatsapp/package.json**:
```json
{
  "name": "@swalha1999/whatsapp",
  "version": "0.1.0",
  "description": "WhatsApp Business API client for Node.js",
  "author": "swalha1999",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/swalha1999/whatsapp.git",
    "directory": "packages/whatsapp"
  },
  "publishConfig": {
    "access": "public"
  },
  "files": ["dist", "README.md"],
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./webhook": {
      "import": "./dist/webhook.mjs",
      "require": "./dist/webhook.js",
      "types": "./dist/webhook.d.ts"
    },
    "./templates": {
      "import": "./dist/templates.mjs",
      "require": "./dist/templates.js",
      "types": "./dist/templates.d.ts"
    }
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "tsdown": "^0.9.5",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  },
  "keywords": ["whatsapp", "whatsapp-api", "whatsapp-business", "messaging"]
}
```

### Step 2.2: Core Types

**src/types.ts** - Webhook payload types (from azimh):
```typescript
// Message types
export type MessageType =
  | 'audio'
  | 'button'
  | 'document'
  | 'text'
  | 'image'
  | 'interactive'
  | 'order'
  | 'sticker'
  | 'system'
  | 'video'
  | 'location'
  | 'contacts'

export type StatusType = 'delivered' | 'failed' | 'read' | 'sent'

// Webhook payload structure
export interface WebhookPayload {
  object: string
  entry: Entry[]
}

export interface Entry {
  id: string
  changes: Change[]
}

export interface Change {
  value: ChangeValue
  field: string
}

export interface ChangeValue {
  messaging_product: string
  metadata: Metadata
  contacts?: Contact[]
  messages?: IncomingMessage[]
  statuses?: StatusUpdate[]
}

export interface Metadata {
  display_phone_number: string
  phone_number_id: string
}

export interface Contact {
  profile: { name: string }
  wa_id: string
}

export interface IncomingMessage {
  from: string
  id: string
  timestamp: string
  type: MessageType
  text?: { body: string }
  button?: { payload: string; text: string }
  interactive?: InteractiveReply
  image?: MediaContent
  audio?: MediaContent
  video?: MediaContent
  document?: MediaContent
  location?: LocationContent
}

export interface InteractiveReply {
  type: 'button_reply' | 'list_reply'
  button_reply?: { id: string; title: string }
  list_reply?: { id: string; title: string }
}

export interface MediaContent {
  id: string
  mime_type: string
  sha256?: string
  caption?: string
}

export interface LocationContent {
  latitude: number
  longitude: number
  name?: string
  address?: string
}

export interface StatusUpdate {
  id: string
  status: StatusType
  timestamp: string
  recipient_id: string
  errors?: StatusError[]
}

export interface StatusError {
  code: number
  title: string
  message?: string
}

// Client configuration
export interface WhatsAppConfig {
  apiToken: string
  phoneNumberId: string
  apiVersion?: string // defaults to 'v22.0'
  baseUrl?: string    // defaults to 'https://graph.facebook.com'
}

// Send message types
export interface SendTextParams {
  to: string
  body: string
  previewUrl?: boolean
}

export interface SendTemplateParams {
  to: string
  templateName: string
  languageCode: string
  components?: TemplateComponent[]
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters?: TemplateParameter[]
  sub_type?: 'quick_reply' | 'url'
  index?: number
}

export interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video'
  text?: string
  image?: { link: string }
  document?: { link: string; filename?: string }
  video?: { link: string }
}

export interface SendResult {
  messageId: string
  success: boolean
  error?: {
    code: number
    message: string
  }
}
```

### Step 2.3: Factory Function

**src/create-whatsapp.ts**:
```typescript
import type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
} from './types'
import { sendText, sendTemplate, markAsRead } from './client'

export interface WhatsApp {
  sendText: (params: SendTextParams) => Promise<SendResult>
  sendTemplate: (params: SendTemplateParams) => Promise<SendResult>
  markAsRead: (messageId: string) => Promise<boolean>
}

export function createWhatsApp(config: WhatsAppConfig): WhatsApp {
  const resolvedConfig = {
    apiVersion: 'v22.0',
    baseUrl: 'https://graph.facebook.com',
    ...config,
  }

  return {
    sendText: (params) => sendText(resolvedConfig, params),
    sendTemplate: (params) => sendTemplate(resolvedConfig, params),
    markAsRead: (messageId) => markAsRead(resolvedConfig, messageId),
  }
}
```

### Step 2.4: API Client

**src/client.ts**:
```typescript
import type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
} from './types'

function getApiUrl(config: WhatsAppConfig): string {
  return `${config.baseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`
}

async function makeRequest<T>(
  config: WhatsAppConfig,
  body: object
): Promise<T> {
  const response = await fetch(getApiUrl(config), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new WhatsAppError(
      error.error?.message || 'Unknown error',
      error.error?.code || response.status
    )
  }

  return response.json()
}

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message)
    this.name = 'WhatsAppError'
  }
}

export async function sendText(
  config: WhatsAppConfig,
  params: SendTextParams
): Promise<SendResult> {
  try {
    const result = await makeRequest<{ messages: [{ id: string }] }>(config, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        preview_url: params.previewUrl ?? false,
        body: params.body,
      },
    })

    return {
      messageId: result.messages[0].id,
      success: true,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      return {
        messageId: '',
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}

export async function sendTemplate(
  config: WhatsAppConfig,
  params: SendTemplateParams
): Promise<SendResult> {
  try {
    const result = await makeRequest<{ messages: [{ id: string }] }>(config, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.languageCode },
        components: params.components,
      },
    })

    return {
      messageId: result.messages[0].id,
      success: true,
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      return {
        messageId: '',
        success: false,
        error: { code: error.code, message: error.message },
      }
    }
    throw error
  }
}

export async function markAsRead(
  config: WhatsAppConfig,
  messageId: string
): Promise<boolean> {
  try {
    await makeRequest(config, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    })
    return true
  } catch {
    return false
  }
}
```

### Step 2.5: Webhook Module

**src/webhook/types.ts**:
```typescript
export interface WebhookVerifyParams {
  mode: string
  token: string
  challenge: string
}

export interface ParsedWebhook {
  type: 'message' | 'status' | 'unknown'
  phoneNumberId: string
  message?: ParsedMessage
  status?: ParsedStatus
}

export interface ParsedMessage {
  id: string
  from: string
  timestamp: Date
  type: string
  content: MessageContent
}

export type MessageContent =
  | { type: 'text'; body: string }
  | { type: 'button'; payload: string; text: string }
  | { type: 'interactive'; replyId: string; replyTitle: string }
  | { type: 'media'; mediaId: string; mimeType: string; caption?: string }
  | { type: 'location'; latitude: number; longitude: number }
  | { type: 'unknown' }

export interface ParsedStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  recipientId: string
  timestamp: Date
  error?: { code: number; message: string }
}
```

**src/webhook/parser.ts**:
```typescript
import type { WebhookPayload, IncomingMessage, StatusUpdate } from '../types'
import type { ParsedWebhook, ParsedMessage, ParsedStatus, MessageContent } from './types'

export function parseWebhookPayload(payload: WebhookPayload): ParsedWebhook[] {
  const results: ParsedWebhook[] = []

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue

      const value = change.value
      const phoneNumberId = value.metadata.phone_number_id

      // Parse messages
      if (value.messages) {
        for (const msg of value.messages) {
          results.push({
            type: 'message',
            phoneNumberId,
            message: parseMessage(msg),
          })
        }
      }

      // Parse statuses
      if (value.statuses) {
        for (const status of value.statuses) {
          results.push({
            type: 'status',
            phoneNumberId,
            status: parseStatus(status),
          })
        }
      }
    }
  }

  return results
}

function parseMessage(msg: IncomingMessage): ParsedMessage {
  return {
    id: msg.id,
    from: msg.from,
    timestamp: new Date(parseInt(msg.timestamp) * 1000),
    type: msg.type,
    content: parseMessageContent(msg),
  }
}

function parseMessageContent(msg: IncomingMessage): MessageContent {
  if (msg.text) {
    return { type: 'text', body: msg.text.body }
  }
  if (msg.button) {
    return { type: 'button', payload: msg.button.payload, text: msg.button.text }
  }
  if (msg.interactive) {
    const reply = msg.interactive.button_reply || msg.interactive.list_reply
    return {
      type: 'interactive',
      replyId: reply?.id || '',
      replyTitle: reply?.title || '',
    }
  }
  if (msg.image || msg.audio || msg.video || msg.document) {
    const media = msg.image || msg.audio || msg.video || msg.document!
    return {
      type: 'media',
      mediaId: media.id,
      mimeType: media.mime_type,
      caption: media.caption,
    }
  }
  if (msg.location) {
    return {
      type: 'location',
      latitude: msg.location.latitude,
      longitude: msg.location.longitude,
    }
  }
  return { type: 'unknown' }
}

function parseStatus(status: StatusUpdate): ParsedStatus {
  return {
    messageId: status.id,
    status: status.status as ParsedStatus['status'],
    recipientId: status.recipient_id,
    timestamp: new Date(parseInt(status.timestamp) * 1000),
    error: status.errors?.[0]
      ? { code: status.errors[0].code, message: status.errors[0].title }
      : undefined,
  }
}
```

**src/webhook/verify.ts**:
```typescript
import type { WebhookVerifyParams } from './types'

export function verifyWebhook(
  params: WebhookVerifyParams,
  expectedToken: string
): { valid: boolean; challenge?: string } {
  if (params.mode === 'subscribe' && params.token === expectedToken) {
    return { valid: true, challenge: params.challenge }
  }
  return { valid: false }
}
```

**src/webhook/index.ts**:
```typescript
export { parseWebhookPayload } from './parser'
export { verifyWebhook } from './verify'
export type {
  WebhookVerifyParams,
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  MessageContent,
} from './types'
```

### Step 2.6: Template Builders

**src/templates/types.ts**:
```typescript
import type { TemplateComponent } from '../types'

export interface TemplateBuilder {
  addHeader(type: 'image' | 'video' | 'document', url: string): TemplateBuilder
  addTextHeader(text: string): TemplateBuilder
  addBodyParam(text: string): TemplateBuilder
  addQuickReplyButton(index: number, payload: string): TemplateBuilder
  build(): TemplateComponent[]
}
```

**src/templates/builders.ts**:
```typescript
import type { TemplateComponent, TemplateParameter } from '../types'
import type { TemplateBuilder } from './types'

export function createTemplateBuilder(): TemplateBuilder {
  const components: TemplateComponent[] = []
  const bodyParams: TemplateParameter[] = []

  return {
    addHeader(type, url) {
      components.push({
        type: 'header',
        parameters: [{ type, [type]: { link: url } }],
      })
      return this
    },

    addTextHeader(text) {
      components.push({
        type: 'header',
        parameters: [{ type: 'text', text }],
      })
      return this
    },

    addBodyParam(text) {
      bodyParams.push({ type: 'text', text })
      return this
    },

    addQuickReplyButton(index, payload) {
      components.push({
        type: 'button',
        sub_type: 'quick_reply',
        index,
        parameters: [{ type: 'text', text: payload }],
      })
      return this
    },

    build() {
      if (bodyParams.length > 0) {
        components.push({
          type: 'body',
          parameters: bodyParams,
        })
      }
      return components
    },
  }
}
```

**src/templates/index.ts**:
```typescript
export { createTemplateBuilder } from './builders'
export type { TemplateBuilder } from './types'
```

### Step 2.7: Main Entry Point

**src/index.ts**:
```typescript
// Factory function
export { createWhatsApp } from './create-whatsapp'
export type { WhatsApp } from './create-whatsapp'

// Core types
export type {
  WhatsAppConfig,
  SendTextParams,
  SendTemplateParams,
  SendResult,
  MessageType,
  StatusType,
  WebhookPayload,
  IncomingMessage,
  StatusUpdate,
  TemplateComponent,
  TemplateParameter,
} from './types'

// Error class
export { WhatsAppError } from './client'

// Template builders
export { createTemplateBuilder } from './templates'
export type { TemplateBuilder } from './templates'

// Webhook utilities (also available as separate import)
export {
  parseWebhookPayload,
  verifyWebhook,
} from './webhook'
export type {
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  MessageContent,
  WebhookVerifyParams,
} from './webhook'
```

---

## Phase 3: Drizzle Adapter (Optional)

### Step 3.1: Schema Definition

**packages/adapter-drizzle/src/schema.ts**:
```typescript
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
```

### Step 3.2: Adapter Implementation

**packages/adapter-drizzle/src/adapter.ts**:
```typescript
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
  db: PostgresJsDatabase<any>
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
        [`${status}At`]: new Date(),
        updatedAt: new Date(),
      }
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
```

---

## Phase 4: Example Usage

### Example: Next.js Integration

```typescript
// lib/whatsapp.ts
import { createWhatsApp } from '@swalha1999/whatsapp'

export const whatsapp = createWhatsApp({
  apiToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
})

// Usage in a server action
async function sendInvitation(phone: string, name: string) {
  const result = await whatsapp.sendTemplate({
    to: phone,
    templateName: 'hall_invite',
    languageCode: 'ar',
    components: createTemplateBuilder()
      .addHeader('image', 'https://...')
      .addBodyParam(name)
      .addBodyParam('Wedding Hall')
      .addBodyParam('2025-01-15')
      .addQuickReplyButton(0, 'yes')
      .addQuickReplyButton(1, 'no')
      .build(),
  })

  if (!result.success) {
    console.error('Failed to send:', result.error)
  }

  return result
}
```

### Example: Webhook Handler

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

  if (result.valid) {
    return new Response(result.challenge)
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const payload = await request.json()
  const events = parseWebhookPayload(payload)

  for (const event of events) {
    if (event.type === 'message' && event.message) {
      console.log('Message from:', event.message.from)
      console.log('Content:', event.message.content)
    }

    if (event.type === 'status' && event.status) {
      console.log('Status update:', event.status.status)
    }
  }

  return new Response('OK')
}
```

---

## Implementation Checklist

### Phase 1: Repository Setup
- [ ] Create repository at `/Users/swalha/code/whatsapp`
- [ ] Initialize git
- [ ] Create root package.json
- [ ] Create pnpm-workspace.yaml
- [ ] Create turbo.json
- [ ] Create root tsconfig.json
- [ ] Create .gitignore and .npmrc

### Phase 2: Core Package
- [ ] Create packages/whatsapp directory structure
- [ ] Create package.json with exports
- [ ] Create tsconfig.json and tsdown.config.ts
- [ ] Implement src/types.ts (webhook types from azimh)
- [ ] Implement src/client.ts (API client)
- [ ] Implement src/create-whatsapp.ts (factory)
- [ ] Implement src/webhook/* (parser and verify)
- [ ] Implement src/templates/* (builders)
- [ ] Create src/index.ts with all exports
- [ ] Write unit tests
- [ ] Create README.md

### Phase 3: Drizzle Adapter (Optional)
- [ ] Create packages/adapter-drizzle directory
- [ ] Implement schema.ts
- [ ] Implement adapter.ts
- [ ] Create package.json with schema subpath export

### Phase 4: Publish
- [ ] Test build locally
- [ ] Create GitHub repository
- [ ] Push code
- [ ] Publish to npm

---

## Migration from azimh

Files to reference when implementing:
1. `azimh/src/lib/whatsapp/types.ts` → `whatsapp/packages/whatsapp/src/types.ts`
2. `azimh/src/lib/whatsapp/index.ts` → `whatsapp/packages/whatsapp/src/client.ts`
3. `azimh/src/lib/whatsapp/payload.ts` → `whatsapp/packages/whatsapp/src/webhook/parser.ts`
4. `azimh/src/app/api/whatsapp/webhook/route.ts` → Reference for webhook handling
5. `azimh/src/db/schema-auth.ts` (whatsapp_messages) → `adapter-drizzle/src/schema.ts`
