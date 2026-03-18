import { createContext, useCallback, useContext, useState } from 'react'
import { tenants as tenantsApi } from '../lib/api'
import * as auth from '../lib/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (key: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useAuthProvider(): AuthContextValue {
  const [isAuth, setIsAuth] = useState(auth.isAuthenticated())

  const login = useCallback(async (key: string): Promise<boolean> => {
    auth.setApiKey(key)
    try {
      await tenantsApi.list()
      setIsAuth(true)
      return true
    } catch {
      auth.clearApiKey()
      setIsAuth(false)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    auth.clearApiKey()
    setIsAuth(false)
  }, [])

  return { isAuthenticated: isAuth, login, logout }
}
