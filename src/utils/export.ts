const escapeCsvValue = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export interface ExportColumn<T> {
  title: string
  dataIndex: keyof T
  formatter?: (value: T[keyof T], row: T) => string
}

export const exportToCsv = <T extends object>(filename: string, columns: Array<ExportColumn<T>>, rows: T[]) => {
  if (!rows.length) {
    return false
  }

  const headers = columns.map((item) => escapeCsvValue(item.title)).join(',')
  const body = rows
    .map((row) => columns
      .map((column) => {
        const raw = row[column.dataIndex]
        if (column.formatter) {
          return escapeCsvValue(column.formatter(raw, row))
        }
        return escapeCsvValue(raw)
      })
      .join(','))
    .join('\n')

  const content = `\uFEFF${headers}\n${body}`
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  return true
}
