import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { authApi, setAccessToken, type User } from '../lib/api'

export type Role = 'admin' | 'manager' | 'client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  clientId?: string
  avatar?: string
  forcePasswordReset: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (user: AuthUser, accessToken: string) => void
  logout: () => Promise<void>
  updateUser: (partial: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function userFromApi(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as Role,
    clientId: u.clientId,
    avatar: u.avatar,
    forcePasswordReset: u.forcePasswordReset ?? false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // On mount: restore session via HTTP-only refresh cookie
  useEffect(() => {
    let mounted = true
    authApi.refresh()
      .then(({ accessToken, user: u }) => {
        if (!mounted) return
        setAccessToken(accessToken)
        setUser(userFromApi(u))
      })
      .catch(() => { /* no session — stay logged out */ })
      .finally(() => { if (mounted) setIsInitializing(false) })

    // Listen for forced logout emitted by the API client on unrecoverable 401
    function handleAuthLogout() { setUser(null); setAccessToken(null) }
    window.addEventListener('auth:logout', handleAuthLogout)
    return () => {
      mounted = false
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  const login = useCallback((u: AuthUser, accessToken: string) => {
    setAccessToken(accessToken)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore errors */ }
    setAccessToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitializing, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
