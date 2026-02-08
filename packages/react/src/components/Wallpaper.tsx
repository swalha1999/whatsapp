import type { CSSProperties, ReactNode } from 'react'
import { colors, wallpaperPatternUri } from '../styles'

interface WallpaperProps {
  show: boolean
  children: ReactNode
  style?: CSSProperties
}

export function Wallpaper({ show, children, style }: WallpaperProps) {
  if (!show) {
    return <>{children}</>
  }

  const wallpaperStyle: CSSProperties = {
    backgroundColor: colors.wallpaper,
    backgroundImage: `url("${wallpaperPatternUri}")`,
    backgroundRepeat: 'repeat',
    padding: 16,
    borderRadius: 8,
    ...style,
  }

  return <div style={wallpaperStyle}>{children}</div>
}
