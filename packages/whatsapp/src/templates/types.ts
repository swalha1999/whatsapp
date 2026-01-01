import type { TemplateComponent } from '../types'

export interface TemplateBuilder {
  addHeader(type: 'image' | 'video' | 'document', url: string): TemplateBuilder
  addTextHeader(text: string): TemplateBuilder
  addBodyParam(text: string): TemplateBuilder
  addQuickReplyButton(index: number, payload: string): TemplateBuilder
  build(): TemplateComponent[]
}
