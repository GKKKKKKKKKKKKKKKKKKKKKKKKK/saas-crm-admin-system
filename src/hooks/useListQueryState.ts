import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type SortState = {
  field?: string
  order?: 'ascend' | 'descend'
}

type ValueType = 'string' | 'number' | 'boolean'

type FieldConfig = {
  key: string
  type?: ValueType
}

interface UseListQueryStateOptions {
  defaultPageSize?: number
  fields?: FieldConfig[]
}

const parseByType = (value: string, type: ValueType) => {
  if (type === 'number') {
    const n = Number(value)
    return Number.isNaN(n) ? undefined : n
  }
  if (type === 'boolean') {
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
    return undefined
  }
  return value
}

const stringifyValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  return String(value)
}

export const useListQueryState = ({ defaultPageSize = 10, fields = [] }: UseListQueryStateOptions) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const fieldsKey = JSON.stringify(fields)
  const parsedFields = useMemo<FieldConfig[]>(() => JSON.parse(fieldsKey) as FieldConfig[], [fieldsKey])

  const page = Number(searchParams.get('page') ?? 1) || 1
  const pageSize = Number(searchParams.get('pageSize') ?? defaultPageSize) || defaultPageSize
  const sorter: SortState = {
    field: searchParams.get('sortField') ?? undefined,
    order: (searchParams.get('sortOrder') as SortState['order']) ?? undefined,
  }

  const filters = useMemo(() => {
    const base: Record<string, unknown> = {}
    parsedFields.forEach((item) => {
      const raw = searchParams.get(item.key)
      if (raw === null || raw === '') {
        return
      }
      const parsed = parseByType(raw, item.type ?? 'string')
      if (parsed !== undefined) {
        base[item.key] = parsed
      }
    })
    return base
  }, [parsedFields, searchParams])

  const setQueryState = (next: {
    page?: number
    pageSize?: number
    filters?: Record<string, unknown>
    sorter?: SortState
  }) => {
    const params = new URLSearchParams(searchParams)
    const nextPage = next.page ?? page
    const nextPageSize = next.pageSize ?? pageSize
    params.set('page', String(nextPage))
    params.set('pageSize', String(nextPageSize))

    const targetFilters = next.filters ?? filters
    parsedFields.forEach((item) => {
      const value = stringifyValue(targetFilters[item.key])
      if (!value) {
        params.delete(item.key)
      } else {
        params.set(item.key, value)
      }
    })

    const targetSorter = next.sorter ?? sorter
    if (targetSorter.field && targetSorter.order) {
      params.set('sortField', targetSorter.field)
      params.set('sortOrder', targetSorter.order)
    } else {
      params.delete('sortField')
      params.delete('sortOrder')
    }

    setSearchParams(params)
  }

  const reset = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('pageSize', String(defaultPageSize))
    setSearchParams(params)
  }

  return {
    page,
    pageSize,
    filters,
    sorter,
    setQueryState,
    reset,
  }
}
