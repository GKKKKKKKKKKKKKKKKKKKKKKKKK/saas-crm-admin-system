import { Table } from 'antd'
import type { TablePaginationConfig, TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import TableEmpty from '@/components/TableEmpty'

interface PageTableProps<T> extends TableProps<T> {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  onSortChange?: (sorter: SorterResult<T>) => void
}

const PageTable = <T extends object>({
  total,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  ...props
}: PageTableProps<T>) => {
  const pagination: TablePaginationConfig = {
    total,
    current: page,
    pageSize,
    showSizeChanger: true,
    showTotal: (value) => `共 ${value} 条`,
    onChange: onPageChange,
  }

  return (
    <Table
      rowKey="id"
      className="admin-table"
      size="middle"
      pagination={pagination}
      onChange={(nextPagination, _filters, sorter) => {
        const nextCurrent = nextPagination.current ?? page
        const nextSize = nextPagination.pageSize ?? pageSize
        if (nextCurrent !== page || nextSize !== pageSize) {
          onPageChange(nextCurrent, nextSize)
        }
        if (!Array.isArray(sorter)) {
          onSortChange?.(sorter)
        }
      }}
      locale={{ emptyText: <TableEmpty /> }}
      {...props}
    />
  )
}

export default PageTable
