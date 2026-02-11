import type { CSSProperties } from 'react'

// Header types
export interface ImageHeader {
  type: 'image'
  url: string
  alt?: string
}

export interface VideoHeader {
  type: 'video'
  url: string
  poster?: string
}

export interface DocumentHeader {
  type: 'document'
  filename: string
  url?: string
}

export interface TextHeader {
  type: 'text'
  text: string
}

export type HeaderProps = ImageHeader | VideoHeader | DocumentHeader | TextHeader

// Button types
export interface QuickReplyButton {
  type: 'quick_reply'
  text: string
}

export interface UrlButton {
  type: 'url'
  text: string
  url: string
}

export interface PhoneNumberButton {
  type: 'phone_number'
  text: string
  phoneNumber: string
}

export type TemplateButton = QuickReplyButton | UrlButton | PhoneNumberButton

// Main component props
export interface WhatsAppTemplateProps {
  /** Header content — image, video, document, or text */
  header?: HeaderProps
  /** Body text with {{n}} placeholders for variable substitution */
  body: string
  /** Variables to substitute into body text (e.g. { 1: 'Ahmed' }) */
  bodyVariables?: Record<string | number, string>
  /** Small muted footer text */
  footer?: string
  /** Action buttons below the message */
  buttons?: TemplateButton[]
  /** Timestamp displayed in bottom-right of bubble */
  timestamp?: string
  /** Language code for RTL detection (ar, he, fa, ur, etc.) */
  language?: string
  /** Override text direction (auto-detected from language if not set) */
  direction?: 'ltr' | 'rtl'
  /** Container width (default: 380) */
  width?: number | string
  /** Additional CSS class on the outer container */
  className?: string
  /** Additional inline styles on the outer container */
  style?: CSSProperties
}
