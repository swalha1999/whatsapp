import type { CSSProperties, ReactNode } from 'react'
import { colors, spacing } from '../styles'

interface MessageBubbleProps {
  direction: 'ltr' | 'rtl'
  children: ReactNode
}

export function MessageBubble({ direction, children }: MessageBubbleProps) {
  const isRtl = direction === 'rtl'

  const bubbleStyle: CSSProperties = {
    position: 'relative',
    backgroundColor: colors.bubbleIncoming,
    borderRadius: spacing.bubbleRadius,
    boxShadow: `0 1px 0.5px ${colors.bubbleShadow}`,
    overflow: 'hidden',
    maxWidth: '100%',
  }

  // Tail triangle using border trick
  const tailStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    [isRtl ? 'right' : 'left']: -8,
    width: 0,
    height: 0,
    borderTop: `6px solid ${colors.tailColor}`,
    borderLeft: isRtl ? 'none' : '8px solid transparent',
    borderRight: isRtl ? '8px solid transparent' : 'none',
  }

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isRtl ? 'flex-end' : 'flex-start',
    paddingLeft: isRtl ? 0 : 12,
    paddingRight: isRtl ? 12 : 0,
  }

  return (
    <div style={wrapperStyle}>
      <div style={bubbleStyle}>
        <div style={tailStyle} />
        {children}
      </div>
    </div>
  )
}
