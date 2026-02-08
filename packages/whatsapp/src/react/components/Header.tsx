import type { CSSProperties } from 'react'
import type { HeaderProps } from '../types'
import { colors, fonts, spacing } from '../styles'

interface HeaderComponentProps {
  header: HeaderProps
}

export function Header({ header }: HeaderComponentProps) {
  switch (header.type) {
    case 'image':
      return (
        <div>
          <img
            src={header.url}
            alt={header.alt || ''}
            style={{
              display: 'block',
              width: '100%',
              borderRadius: spacing.headerImageRadius,
              objectFit: 'cover',
            }}
          />
        </div>
      )

    case 'video':
      return (
        <div>
          <video
            src={header.url}
            poster={header.poster}
            controls
            style={{
              display: 'block',
              width: '100%',
              borderRadius: spacing.headerImageRadius,
            }}
          />
        </div>
      )

    case 'document': {
      const docStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        margin: `${spacing.bubblePadding}px ${spacing.bubblePadding}px 0`,
        backgroundColor: colors.headerBackground,
        borderRadius: 6,
      }

      const iconStyle: CSSProperties = {
        width: 32,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.documentIcon,
        fontSize: 24,
        flexShrink: 0,
      }

      return (
        <div style={docStyle}>
          <div style={iconStyle}>
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
              <path
                d="M14 1H3C1.9 1 1 1.9 1 3V27C1 28.1 1.9 29 3 29H21C22.1 29 23 28.1 23 27V10L14 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path d="M14 1V10H23" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: fonts.sizeBody,
              color: colors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {header.filename}
          </span>
        </div>
      )
    }

    case 'text': {
      const textStyle: CSSProperties = {
        padding: `${spacing.bodyPaddingVertical}px ${spacing.bodyPaddingHorizontal + spacing.bubblePadding}px 0`,
        fontSize: fonts.sizeHeader,
        fontWeight: 700,
        color: colors.textPrimary,
      }

      return <div style={textStyle}>{header.text}</div>
    }
  }
}
