import type { CSSProperties } from 'react'
import { colors, fonts, spacing } from '../styles'

interface FooterProps {
  text: string
  direction: 'ltr' | 'rtl'
}

export function Footer({ text, direction }: FooterProps) {
  const footerStyle: CSSProperties = {
    padding: `0 ${spacing.bodyPaddingHorizontal + spacing.bubblePadding}px ${spacing.bodyPaddingVertical}px`,
    fontSize: fonts.sizeFooter,
    color: colors.footerText,
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left',
  }

  return <div style={footerStyle}>{text}</div>
}
