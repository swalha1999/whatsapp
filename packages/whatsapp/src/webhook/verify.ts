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
