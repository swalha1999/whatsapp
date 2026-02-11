import type { CSSProperties } from 'react'

// WhatsApp color palette
export const colors = {
  textPrimary: '#111b21',
  textSecondary: '#667781',
  footerText: '#8696a0',
  timestampText: '#667781',
  buttonText: '#00a5f4',
  buttonBorder: '#e0e0e0',
  buttonBackground: '#ffffff',
  headerBackground: '#e2e2e2',
  documentIcon: '#667781',
} as const

// Typography
export const fonts = {
  family:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  sizeBody: 14.2,
  sizeFooter: 12,
  sizeTimestamp: 11,
  sizeButton: 14,
  sizeHeader: 15,
  lineHeightBody: 1.45,
} as const

// Spacing
export const spacing = {
  bubblePadding: 7,
  bodyPaddingHorizontal: 9,
  bodyPaddingVertical: 6,
  footerPadding: 9,
  buttonGap: 4,
  headerImageRadius: '8px 8px 0 0',
} as const

// RTL language codes
const RTL_LANGUAGES = new Set([
  'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ku', 'ckb', 'syr', 'dv',
])

export function isRtlLanguage(language?: string): boolean {
  if (!language) return false
  const base = language.split(/[-_]/)[0].toLowerCase()
  return RTL_LANGUAGES.has(base)
}

export function getDirection(
  language?: string,
  directionOverride?: 'ltr' | 'rtl',
): 'ltr' | 'rtl' {
  if (directionOverride) return directionOverride
  return isRtlLanguage(language) ? 'rtl' : 'ltr'
}

// Variable substitution
export function substituteVariables(
  text: string,
  variables?: Record<string | number, string>,
): string {
  if (!variables) return text
  return text.replace(/\{\{(\d+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match
  })
}

// Common style helpers
export function containerStyle(width: number | string): CSSProperties {
  return {
    width: typeof width === 'number' ? `${width}px` : width,
    fontFamily: fonts.family,
    fontSize: `${fonts.sizeBody}px`,
    lineHeight: fonts.lineHeightBody,
    color: colors.textPrimary,
    boxSizing: 'border-box',
  }
}
