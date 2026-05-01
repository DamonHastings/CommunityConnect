import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../lib/api'
import type { User, ProfileType } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
  profile_type: ProfileType
}

export interface ProfileUpdateData {
  profile_type?: ProfileType
  bio?: string
  phone?: string
  city?: string
  state?: string
  website?: string
  availability?: string
  services_offered?: string[]
  services_needed?: string[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }
  }, [token, fetchCurrentUser])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { user: { email, password } })
    const authHeader = res.headers['authorization']
    const jwt = authHeader?.replace('Bearer ', '')
    if (jwt) {
      localStorage.setItem('auth_token', jwt)
      setToken(jwt)
    }
    setUser(res.data.user)
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', { user: data })
    const authHeader = res.headers['authorization']
    const jwt = authHeader?.replace('Bearer ', '')
    if (jwt) {
      localStorage.setItem('auth_token', jwt)
      setToken(jwt)
    }
    setUser(res.data.user)
  }

  const logout = async () => {
    try {
      await api.delete('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    const res = await api.patch('/auth/me', { user: data })
    setUser(res.data.user)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
