import type { CSSProperties } from 'react'
import type { TemplateButton } from '../types'
import { colors, fonts, spacing } from '../styles'

interface ButtonsProps {
  buttons: TemplateButton[]
}

export function Buttons({ buttons }: ButtonsProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.buttonGap,
    padding: `${spacing.buttonGap}px ${spacing.bubblePadding}px ${spacing.bubblePadding}px`,
  }

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 16px',
    backgroundColor: colors.buttonBackground,
    border: `1px solid ${colors.buttonBorder}`,
    borderRadius: 6,
    color: colors.buttonText,
    fontSize: fonts.sizeButton,
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.2,
  }

  return (
    <div style={containerStyle}>
      {buttons.map((button, index) => (
        <div key={index} style={buttonStyle}>
          {button.type === 'url' && <UrlIcon />}
          {button.type === 'phone_number' && <PhoneIcon />}
          {button.type === 'quick_reply' && <ReplyIcon />}
          <span>{button.text}</span>
        </div>
      ))}
    </div>
  )
}

function ReplyIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill={colors.buttonText}>
      <path d="M6 4V1L0 7l6 6v-3.2c4.4 0 7.5 1.4 9.7 4.5C14.5 9.9 11.6 5.5 6 4z" />
    </svg>
  )
}

function UrlIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={colors.buttonText} strokeWidth="1.5">
      <path d="M5.5 8.5L8.5 5.5M6 10l-1.3 1.3a2.12 2.12 0 01-3-3L3 7M8 4l1.3-1.3a2.12 2.12 0 013 3L11 7" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill={colors.buttonText}>
      <path d="M2.8 1.2C3 1 3.2.9 3.5.9h1.2c.3 0 .6.2.7.5l.7 1.7c.1.3 0 .6-.2.8L5 4.8c.4.9 1.3 1.8 2.2 2.2l.9-.9c.2-.2.5-.3.8-.2l1.7.7c.3.1.5.4.5.7v1.2c0 .3-.1.5-.3.7-.2.2-.4.3-.7.3C5.4 9.3 4.7 8.6.7 4.6c-.1-.2-.2-.4-.2-.7 0-.3.1-.5.3-.7l2-2z" />
    </svg>
  )
}
