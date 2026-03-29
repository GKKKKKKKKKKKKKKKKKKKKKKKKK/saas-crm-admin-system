import { Modal, Form, Input, Tree, Button, Space } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { PermissionPreset } from '@/types/permissionPreset'
import type { PermissionTreeNode } from '@/types'
import { filterPermissionTree } from '@/utils/permission'

type PresetFormValues = {
  name: string
  code: string
  description?: string
  permissionCodes: string[]
}

interface PresetFormModalProps {
  open: boolean
  loading: boolean
  permissionsTree: PermissionTreeNode[]
  initialValue?: PermissionPreset | null
  onCancel: () => void
  onSubmit: (values: PresetFormValues) => Promise<void>
}

const PresetFormModal = ({ open, loading, permissionsTree, initialValue, onCancel, onSubmit }: PresetFormModalProps) => {
  const [form] = Form.useForm<PresetFormValues>()
  const [filterKeyword, setFilterKeyword] = useState('')
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const filteredTree = useMemo(() => filterPermissionTree(permissionsTree, filterKeyword), [permissionsTree, filterKeyword])

  const allExpandedKeys = useMemo(() => {
    const keys: string[] = []
    permissionsTree.forEach((moduleNode) => {
      keys.push(String(moduleNode.key))
    })
    return keys
  }, [permissionsTree])

  useEffect(() => {
    if (!open) {
      return
    }

    setExpandedKeys(allExpandedKeys)
    setFilterKeyword('')

    if (initialValue) {
      form.setFieldsValue({
        name: initialValue.name,
        code: initialValue.code,
        description: initialValue.description,
        permissionCodes: initialValue.permissions.map((item) => item.code),
      })
      return
    }

    form.resetFields()
  }, [allExpandedKeys, form, initialValue, open])

  return (
    <Modal
      title={initialValue ? '编辑权限预设' : '新增权限预设'}
      open={open}
      width={760}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => {
        void form.validateFields().then(onSubmit)
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="预设名称" rules={[{ required: true, message: '请输入预设名称' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="code" label="预设编码" rules={[{ required: true, message: '请输入预设编码' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="预设描述">
          <Input.TextArea rows={3} maxLength={255} />
        </Form.Item>
        <Form.Item
          name="permissionCodes"
          label="权限分配"
          rules={[{ required: true, type: 'array', min: 1, message: '请至少选择一个权限' }]}
        >
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Input.Search allowClear placeholder="按权限名称或编码过滤" value={filterKeyword} onChange={(event) => setFilterKeyword(event.target.value)} style={{ width: 320 }} />
              <Button onClick={() => setExpandedKeys(allExpandedKeys)}>全部展开</Button>
              <Button onClick={() => setExpandedKeys([])}>全部折叠</Button>
            </Space>
            <Form.Item noStyle shouldUpdate>
              {() => (
                <Tree
                  checkable
                  selectable={false}
                  height={360}
                  treeData={filteredTree}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys.map((key) => String(key)))}
                  checkedKeys={form.getFieldValue('permissionCodes') ?? []}
                  onCheck={(checkedKeys) => {
                    const next = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked
                    form.setFieldValue('permissionCodes', next.map((item) => String(item)).filter((item) => item.includes('.')))
                  }}
                />
              )}
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PresetFormModal
