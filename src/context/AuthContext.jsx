"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("access_token")
    if (token) {
      try {
        const response = await authAPI.getProfile()
        setUser(response.data)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access, refresh, user: userData } = response.data

      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)

      // Set user data immediately
      setUser(userData)
      setIsAuthenticated(true)

      // Also fetch fresh profile data to ensure we have complete user info
      try {
        const profileResponse = await authAPI.getProfile()
        setUser(profileResponse.data)
      } catch (profileError) {
        // If profile fetch fails, keep the user data from login response
        console.warn("Failed to fetch profile after login:", profileError)
      }

      return { success: true }
    } catch (error) {
      let errorMessage = "Login failed"

      if (error.response?.data) {
        // Handle different error response formats
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0]
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, data: response.data }
    } catch (error) {
      let errorMessage = "Registration failed"

      if (error.response?.data) {
        // Handle validation errors
        if (typeof error.response.data === "object") {
          const errors = []
          Object.keys(error.response.data).forEach((key) => {
            if (Array.isArray(error.response.data[key])) {
              errors.push(`${key}: ${error.response.data[key].join(", ")}`)
            } else {
              errors.push(`${key}: ${error.response.data[key]}`)
            }
          })
          errorMessage = errors.join("; ")
        } else {
          errorMessage = error.response.data
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
