import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.forcePasswordReset && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!user || !allowed.includes(user.role)) {
      return <Navigate to="/403" replace />
    }
  }

  return <>{children}</>
}
