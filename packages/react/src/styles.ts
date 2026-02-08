import type { CSSProperties } from 'react'

// WhatsApp color palette
export const colors = {
  wallpaper: '#e5ddd5',
  bubbleOutgoing: '#dcf8c6',
  bubbleIncoming: '#ffffff',
  bubbleShadow: 'rgba(0, 0, 0, 0.13)',
  textPrimary: '#111b21',
  textSecondary: '#667781',
  footerText: '#8696a0',
  timestampText: '#667781',
  buttonText: '#00a5f4',
  buttonBorder: '#e0e0e0',
  buttonBackground: '#ffffff',
  headerBackground: '#e2e2e2',
  documentIcon: '#667781',
  tailColor: '#ffffff',
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
  bubbleRadius: 8,
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

// Wallpaper SVG data URI — subtle doodle pattern
export const wallpaperPatternUri = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" opacity="0.06">
    <circle cx="20" cy="20" r="2" fill="#888"/>
    <circle cx="100" cy="50" r="1.5" fill="#888"/>
    <circle cx="200" cy="30" r="2" fill="#888"/>
    <circle cx="280" cy="80" r="1.5" fill="#888"/>
    <circle cx="50" cy="120" r="2" fill="#888"/>
    <circle cx="150" cy="100" r="1.5" fill="#888"/>
    <circle cx="250" cy="140" r="2" fill="#888"/>
    <circle cx="30" cy="200" r="1.5" fill="#888"/>
    <circle cx="130" cy="180" r="2" fill="#888"/>
    <circle cx="220" cy="220" r="1.5" fill="#888"/>
    <circle cx="80" cy="270" r="2" fill="#888"/>
    <circle cx="180" cy="260" r="1.5" fill="#888"/>
    <circle cx="270" cy="280" r="2" fill="#888"/>
  </svg>`,
)}`

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
