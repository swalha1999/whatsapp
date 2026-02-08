import type { CSSProperties } from 'react'
import type { WhatsAppTemplateProps } from './types'
import { containerStyle as makeContainerStyle, getDirection } from './styles'
import { Wallpaper } from './components/Wallpaper'
import { MessageBubble } from './components/MessageBubble'
import { Header } from './components/Header'
import { Body } from './components/Body'
import { Footer } from './components/Footer'
import { Buttons } from './components/Buttons'
import { Timestamp } from './components/Timestamp'

export function WhatsAppTemplate({
  header,
  body,
  bodyVariables,
  footer,
  buttons,
  timestamp,
  language,
  direction: directionOverride,
  showWallpaper = true,
  width = 380,
  className,
  style,
}: WhatsAppTemplateProps) {
  const dir = getDirection(language, directionOverride)

  const outerStyle: CSSProperties = {
    ...makeContainerStyle(width),
    ...style,
  }

  // The body + footer + timestamp area needs position: relative for timestamp absolute positioning
  const contentAreaStyle: CSSProperties = {
    position: 'relative',
  }

  return (
    <div className={className} style={outerStyle} dir={dir}>
      <Wallpaper show={showWallpaper}>
        <MessageBubble direction={dir}>
          {header && <Header header={header} />}
          <div style={contentAreaStyle}>
            <Body
              text={body}
              variables={bodyVariables}
              direction={dir}
              hasTimestamp={!!timestamp}
            />
            {footer && <Footer text={footer} direction={dir} />}
            {timestamp && <Timestamp time={timestamp} direction={dir} />}
          </div>
          {buttons && buttons.length > 0 && <Buttons buttons={buttons} />}
        </MessageBubble>
      </Wallpaper>
    </div>
  )
}
