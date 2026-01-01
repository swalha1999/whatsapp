import { createHmac, timingSafeEqual } from 'crypto'
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

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  appSecret: string
): boolean {
  // Signature format: "sha256=abc123..."
  const [algorithm, hash] = signature.split('=')

  if (algorithm !== 'sha256' || !hash) {
    return false
  }

  const expectedHash = createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))
  } catch {
    return false
  }
}
