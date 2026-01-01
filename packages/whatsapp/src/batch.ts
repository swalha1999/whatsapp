import type { SendResult } from './types'

export interface BatchOptions<T> {
  batchSize?: number
  delayMs?: number
  onProgress?: (completed: number, total: number) => void
  onError?: (error: SendResult, item: T, index: number) => void
}

export interface BatchResult {
  total: number
  successful: number
  failed: number
  results: SendResult[]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function batchSend<T>(
  items: T[],
  sendFn: (item: T) => Promise<SendResult>,
  options?: BatchOptions<T>
): Promise<BatchResult> {
  const batchSize = options?.batchSize ?? 50
  const delayMs = options?.delayMs ?? 1000

  const results: SendResult[] = []
  let successful = 0
  let failed = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const result = await sendFn(item)
    results.push(result)

    if (result.success) {
      successful++
    } else {
      failed++
      options?.onError?.(result, item, i)
    }

    options?.onProgress?.(i + 1, items.length)

    // Add delay after each batch (except after the last item)
    if ((i + 1) % batchSize === 0 && i + 1 < items.length) {
      await delay(delayMs)
    }
  }

  return {
    total: items.length,
    successful,
    failed,
    results,
  }
}
