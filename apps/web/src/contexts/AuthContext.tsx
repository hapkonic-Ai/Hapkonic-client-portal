import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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
  login: (user: AuthUser, accessToken: string) => void
  logout: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback((user: AuthUser, _accessToken: string) => {
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
