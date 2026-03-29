import { useMemo, useState } from 'react'
import { storage } from '@/utils/storage'

export interface ColumnSettingItem {
  key: string
  label: string
  defaultVisible?: boolean
  fixedVisible?: boolean
}

const toStorageKey = (id: string) => `table-columns:${id}`

const getInitialVisible = (storageId: string, columns: ColumnSettingItem[]) => {
  const fallback = columns.reduce<Record<string, boolean>>((acc, item) => {
    acc[item.key] = item.fixedVisible || item.defaultVisible !== false
    return acc
  }, {})
  const raw = storage.get(toStorageKey(storageId))
  if (!raw) {
    return fallback
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return columns.reduce<Record<string, boolean>>((acc, item) => {
      if (item.fixedVisible) {
        acc[item.key] = true
        return acc
      }
      acc[item.key] = parsed[item.key] ?? fallback[item.key]
      return acc
    }, {})
  } catch {
    return fallback
  }
}

export const useColumnSettings = (storageId: string, columns: ColumnSettingItem[]) => {
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>(() => getInitialVisible(storageId, columns))

  const updateVisibleMap = (nextMap: Record<string, boolean>) => {
    setVisibleMap(nextMap)
    storage.set(toStorageKey(storageId), JSON.stringify(nextMap))
  }

  const setVisible = (key: string, visible: boolean) => {
    const target = columns.find((item) => item.key === key)
    if (!target || target.fixedVisible) {
      return
    }
    updateVisibleMap({ ...visibleMap, [key]: visible })
  }

  const visibleKeys = useMemo(() => Object.keys(visibleMap).filter((key) => visibleMap[key]), [visibleMap])

  return {
    visibleMap,
    setVisible,
    visibleKeys,
  }
}
