// simplified for public showcase
import type { PropsWithChildren } from 'react'

export const AuthGuard = ({ children }: PropsWithChildren) => {
  return children
}

export const PermissionGuard = ({ children }: PropsWithChildren<{ permission?: string }>) => {
  return children
}
