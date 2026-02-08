import type { CSSProperties } from 'react'
import { fonts, spacing, colors, substituteVariables } from '../styles'

interface BodyProps {
  text: string
  variables?: Record<string | number, string>
  direction: 'ltr' | 'rtl'
  hasTimestamp: boolean
}

export function Body({ text, variables, direction, hasTimestamp }: BodyProps) {
  const substituted = substituteVariables(text, variables)

  const bodyStyle: CSSProperties = {
    padding: `${spacing.bodyPaddingVertical}px ${spacing.bodyPaddingHorizontal + spacing.bubblePadding}px`,
    fontSize: fonts.sizeBody,
    lineHeight: fonts.lineHeightBody,
    color: colors.textPrimary,
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  }

  // Invisible spacer so text doesn't overlap the timestamp
  const spacerStyle: CSSProperties = {
    display: 'inline-block',
    width: hasTimestamp ? 70 : 0,
    height: 0,
  }

  return (
    <div style={bodyStyle}>
      {substituted}
      <span style={spacerStyle} />
    </div>
  )
}
