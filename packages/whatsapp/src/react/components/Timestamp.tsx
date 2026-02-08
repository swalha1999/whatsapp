import type { CSSProperties } from 'react'
import { colors, fonts, spacing } from '../styles'

interface TimestampProps {
  time: string
  direction: 'ltr' | 'rtl'
}

export function Timestamp({ time, direction }: TimestampProps) {
  const timestampStyle: CSSProperties = {
    position: 'absolute',
    bottom: spacing.bodyPaddingVertical,
    right: direction === 'rtl' ? undefined : spacing.bodyPaddingHorizontal + spacing.bubblePadding,
    left: direction === 'rtl' ? spacing.bodyPaddingHorizontal + spacing.bubblePadding : undefined,
    fontSize: fonts.sizeTimestamp,
    color: colors.timestampText,
    whiteSpace: 'nowrap',
  }

  return <span style={timestampStyle}>{time}</span>
}
