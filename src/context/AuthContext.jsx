import { createContext, useState, useEffect, useContext } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const { user, token } = await authApi.login(email, password)
    localStorage.setItem('token', token)
    setUser(user)
    // Navigation will be handled in the component
    return user
  }

  const register = async (userData) => {
    const { user, token } = await authApi.register(userData)
    localStorage.setItem('token', token)
    setUser(user)
    // Navigation will be handled in the component
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }))
    localStorage.setItem('user', JSON.stringify({
      ...user,
      ...updatedUserData
    }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
