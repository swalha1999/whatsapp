import type { WebhookPayload, IncomingMessage, StatusUpdate, Contact } from '../types'
import type {
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  ParsedContact,
  MessageContent,
  ParsedContactCard,
} from './types'

export function parseWebhookPayload(payload: WebhookPayload): ParsedWebhook[] {
  const results: ParsedWebhook[] = []

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue

      const value = change.value
      const phoneNumberId = value.metadata.phone_number_id

      // Get contact info if available
      const contactInfo = value.contacts?.[0]
      const contact = contactInfo ? parseContact(contactInfo) : undefined

      // Parse messages
      if (value.messages) {
        for (const msg of value.messages) {
          results.push({
            type: 'message',
            phoneNumberId,
            message: parseMessage(msg),
            contact,
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

function parseContact(contact: Contact): ParsedContact {
  return {
    name: contact.profile.name,
    waId: contact.wa_id,
  }
}

function parseMessage(msg: IncomingMessage): ParsedMessage {
  return {
    id: msg.id,
    from: msg.from,
    timestamp: new Date(parseInt(msg.timestamp) * 1000),
    type: msg.type,
    content: parseMessageContent(msg),
    context: msg.context ? {
      from: msg.context.from,
      id: msg.context.id,
    } : undefined,
  }
}

function parseMessageContent(msg: IncomingMessage): MessageContent {
  // Text message
  if (msg.text) {
    return { type: 'text', body: msg.text.body }
  }

  // Button reply
  if (msg.button) {
    return { type: 'button', payload: msg.button.payload, text: msg.button.text }
  }

  // Interactive reply (button or list)
  if (msg.interactive) {
    const reply = msg.interactive.button_reply || msg.interactive.list_reply
    return {
      type: 'interactive',
      replyId: reply?.id || '',
      replyTitle: reply?.title || '',
      replyDescription: msg.interactive.list_reply?.description,
    }
  }

  // Image
  if (msg.image) {
    return {
      type: 'media',
      mediaType: 'image',
      mediaId: msg.image.id,
      mimeType: msg.image.mime_type,
      caption: msg.image.caption,
    }
  }

  // Video
  if (msg.video) {
    return {
      type: 'media',
      mediaType: 'video',
      mediaId: msg.video.id,
      mimeType: msg.video.mime_type,
      caption: msg.video.caption,
    }
  }

  // Audio
  if (msg.audio) {
    return {
      type: 'media',
      mediaType: 'audio',
      mediaId: msg.audio.id,
      mimeType: msg.audio.mime_type,
    }
  }

  // Document
  if (msg.document) {
    return {
      type: 'media',
      mediaType: 'document',
      mediaId: msg.document.id,
      mimeType: msg.document.mime_type,
      caption: msg.document.caption,
      filename: msg.document.filename,
    }
  }

  // Sticker
  if (msg.sticker) {
    return {
      type: 'sticker',
      stickerId: msg.sticker.id,
      mimeType: msg.sticker.mime_type,
      animated: msg.sticker.animated,
    }
  }

  // Location
  if (msg.location) {
    return {
      type: 'location',
      latitude: msg.location.latitude,
      longitude: msg.location.longitude,
      name: msg.location.name,
      address: msg.location.address,
    }
  }

  // Reaction
  if (msg.reaction) {
    return {
      type: 'reaction',
      emoji: msg.reaction.emoji,
      messageId: msg.reaction.message_id,
    }
  }

  // Contacts
  if (msg.contacts) {
    return {
      type: 'contacts',
      contacts: msg.contacts.map((c): ParsedContactCard => ({
        formattedName: c.name.formatted_name,
        firstName: c.name.first_name,
        lastName: c.name.last_name,
        phones: c.phones,
      })),
    }
  }

  return { type: 'unknown' }
}

function parseStatus(status: StatusUpdate): ParsedStatus {
  const parsed: ParsedStatus = {
    messageId: status.id,
    status: status.status as ParsedStatus['status'],
    recipientId: status.recipient_id,
    timestamp: new Date(parseInt(status.timestamp) * 1000),
  }

  // Error info
  if (status.errors?.[0]) {
    parsed.error = {
      code: status.errors[0].code,
      message: status.errors[0].title,
    }
  }

  // Conversation info
  if (status.conversation) {
    parsed.conversation = {
      id: status.conversation.id,
      origin: status.conversation.origin.type,
      expiresAt: status.conversation.expiration_timestamp
        ? new Date(parseInt(status.conversation.expiration_timestamp) * 1000)
        : undefined,
    }
  }

  // Pricing info
  if (status.pricing) {
    parsed.pricing = {
      billable: status.pricing.billable,
      category: status.pricing.category,
    }
  }

  return parsed
}
