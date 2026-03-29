export const getAvatarText = (name?: string | null): string => {
  const value = (name ?? '').trim()
  if (!value) {
    return '?'
  }
  const firstHan = value.match(/[\u4e00-\u9fff]/)
  if (firstHan) {
    return firstHan[0]
  }
  return value.charAt(0).toUpperCase()
}

export const getAvatarBgColor = (name?: string | null, customColor?: string): string => {
  const custom = customColor?.trim()
  if (custom) {
    return custom
  }
  const source = (name ?? '').trim() || '?'
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 62%, 48%)`
}
