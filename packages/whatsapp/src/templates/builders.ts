import type { TemplateComponent, TemplateParameter } from '../types'
import type { TemplateBuilder } from './types'

export function createTemplateBuilder(): TemplateBuilder {
  const components: TemplateComponent[] = []
  const bodyParams: TemplateParameter[] = []

  return {
    addHeader(type, url) {
      components.push({
        type: 'header',
        parameters: [{ type, [type]: { link: url } } as TemplateParameter],
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

    addUrlButton(index, dynamicSuffix) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index,
        parameters: [{ type: 'text', text: dynamicSuffix }],
      })
      return this
    },

    build() {
      const result = [...components]
      if (bodyParams.length > 0) {
        result.push({
          type: 'body',
          parameters: bodyParams,
        })
      }
      return result
    },
  }
}
