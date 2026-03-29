import { createBrowserRouter, Navigate } from 'react-router-dom'
import BasicLayout from '@/layouts/BasicLayout'
import { AuthGuard, PermissionGuard } from '@/router/guards'
import LoginPage from '@/pages/auth/LoginPage'
import AcceptInvitePage from '@/pages/auth/AcceptInvitePage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import CustomerFollowUpsPage from '@/pages/customer-follow-ups/CustomerFollowUpsPage'
import ContractsPage from '@/pages/contracts/ContractsPage'
import PaymentsPage from '@/pages/payments/PaymentsPage'
import UsersPage from '@/pages/users/UsersPage'
import RolesPage from '@/pages/roles/RolesPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import ForbiddenPage from '@/pages/error/ForbiddenPage'
import PermissionPresetsPage from '@/pages/PermissionPresets'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import { useAppStore } from '@/store/app'

const HomeRedirect = () => {
  const menus = useAppStore((state) => state.menus)
  const nextPath = menus[0]?.path ?? '/403'
  return <Navigate to={nextPath} replace />
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/accept-invite', element: <AcceptInvitePage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/403',
    element: (
      <GlobalErrorBoundary>
        <ForbiddenPage />
      </GlobalErrorBoundary>
    ),
  },
  {
    path: '/',
    element: (
      <GlobalErrorBoundary>
        <AuthGuard>
          <BasicLayout />
        </AuthGuard>
      </GlobalErrorBoundary>
    ),
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: '/dashboard', element: <PermissionGuard permission="dashboard.view"><DashboardPage /></PermissionGuard> },
      { path: '/customers', element: <PermissionGuard permission="customers.read"><CustomersPage /></PermissionGuard> },
      { path: '/orders', element: <PermissionGuard permission="orders.read"><OrdersPage /></PermissionGuard> },
      { path: '/customer-follow-ups', element: <PermissionGuard permission="customer_followups.view"><CustomerFollowUpsPage /></PermissionGuard> },
      { path: '/contracts', element: <PermissionGuard permission="contracts.view"><ContractsPage /></PermissionGuard> },
      { path: '/payments', element: <PermissionGuard permission="payments.view"><PaymentsPage /></PermissionGuard> },
      { path: '/users', element: <PermissionGuard permission="users.read"><UsersPage /></PermissionGuard> },
      { path: '/roles', element: <PermissionGuard permission="roles.read"><RolesPage /></PermissionGuard> },
      { path: '/permission-presets', element: <PermissionGuard permission="permissionPreset.read"><PermissionPresetsPage /></PermissionGuard> },
      { path: '/profile', element: <PermissionGuard permission="profile.read"><ProfilePage /></PermissionGuard> },
      { path: '/notifications', element: <PermissionGuard permission="notifications.view"><NotificationsPage /></PermissionGuard> },
    ],
  },
])

export default router
