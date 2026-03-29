export const getFallbackPage = (page: number, pageSize: number, total: number, removedCount: number) => {
  const nextTotal = Math.max(0, total - removedCount)
  const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize))
  return Math.min(page, maxPage)
}

export const isFilterActive = (filters: Record<string, unknown>) => Object.values(filters).some((item) => item !== undefined && item !== null && item !== '')
