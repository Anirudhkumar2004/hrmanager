import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const accessToken = localStorage.getItem('hrgenius_access')
    if (!accessToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me/')
      setUser(response.data)
    } catch {
      setUser(null)
      localStorage.removeItem('hrgenius_access')
      localStorage.removeItem('hrgenius_refresh')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    localStorage.setItem('hrgenius_access', response.data.access)
    localStorage.setItem('hrgenius_refresh', response.data.refresh)
    setUser(response.data.user)
    return response.data.user
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('hrgenius_refresh')
    try {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken })
      }
    } finally {
      localStorage.removeItem('hrgenius_access')
      localStorage.removeItem('hrgenius_refresh')
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, reloadUser: loadUser }),
    [user, loading, loadUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
