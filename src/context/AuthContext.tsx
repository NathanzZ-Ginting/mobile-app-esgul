import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../services/supabaseClient'
import { User, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isLoading: boolean
  isSignedIn: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    bootstrapAsync()
  }, [])

  const bootstrapAsync = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (userData) {
          setUser(userData)
          setRole(userData.role)
        }
      }
    } catch (error) {
      console.error('Bootstrap error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Login attempt:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔑 Auth response error:', error)
      console.log('🔑 Auth response data:', data)

      if (error) {
        console.error('❌ Auth error:', error.message, error.code)
        throw error
      }

      if (data.user) {
        console.log('✅ User authenticated:', data.user.id)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        console.log('👤 User query error:', userError)
        console.log('👤 User data:', userData)

        if (userData) {
          setUser(userData)
          setRole(userData.role)
          console.log('✅ Login complete, user set:', userData.email)
        }
      }
    } catch (err: any) {
      console.error('💥 Login catch error:', err.message)
      throw err
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          name,
          role: 'user',
          phone: '',
          address: '',
        },
      ])

      if (insertError) throw insertError

      setUser({
        id: data.user.id,
        email,
        name,
        phone: '',
        address: '',
        role: 'user',
        created_at: new Date().toISOString(),
      })
      setRole('user')
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isSignedIn: !!user,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
