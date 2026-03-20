import { useAuth } from '../contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role ?? 'client'
  return {
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isClient: role === 'client',
    canCreate: role === 'admin' || role === 'manager',
    canEdit: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
  }
}
