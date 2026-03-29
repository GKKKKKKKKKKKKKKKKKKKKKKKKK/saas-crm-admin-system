<template>
  <div class="user-avatar" :style="avatarStyle" :title="safeName">
    <span class="user-avatar-text">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AvatarProps = {
  name: string
  size?: number | string
  bgColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 40,
  textColor: '#fff'
})

const safeName = computed(() => (props.name ?? '').trim())

const displayText = computed(() => {
  const value = safeName.value
  if (!value) return '?'
  const firstHan = value.match(/[\u4e00-\u9fff]/)
  if (firstHan) return firstHan[0]
  return value.charAt(0).toUpperCase()
})

const toPx = (size: number | string): string => {
  if (typeof size === 'number') return `${size}px`
  const raw = String(size).trim()
  if (!raw) return '40px'
  return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw
}

const hashToHsl = (value: string): string => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 62%, 48%)`
}

const finalBgColor = computed(() => {
  const custom = props.bgColor?.trim()
  if (custom) return custom
  return hashToHsl(safeName.value || '?')
})

const finalSize = computed(() => toPx(props.size))

const avatarStyle = computed(() => ({
  width: finalSize.value,
  height: finalSize.value,
  minWidth: finalSize.value,
  minHeight: finalSize.value,
  borderRadius: '50%',
  backgroundColor: finalBgColor.value,
  color: props.textColor,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: `calc(${finalSize.value} * 0.42)`,
  fontWeight: 600,
  lineHeight: '1',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  position: 'relative',
  zIndex: '1',
  userSelect: 'none',
  boxSizing: 'border-box'
}))
</script>

<style scoped>
.user-avatar {
  vertical-align: middle;
}

.user-avatar-text {
  display: block;
  color: inherit;
  opacity: 1;
  line-height: 1;
  font-size: inherit;
  transform: translateY(0);
  pointer-events: none;
}
</style>
