import type { WebhookPayload, IncomingMessage, StatusUpdate } from '../types'
import type {
  ParsedWebhook,
  ParsedMessage,
  ParsedStatus,
  MessageContent,
} from './types'

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
