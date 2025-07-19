"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { firebaseAuthService } from '@/services/firebase-auth'
import { toast } from '@/components/ui/use-toast'

interface User {
  uid: string
  email: string
  name: string
  role: 'employer' | 'worker'
  profile?: {
    avatar?: string
    skills?: string[]
    experience?: string
    location?: string
    hourlyRate?: number
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  registerWithEmail: (email: string, password: string, userData: { name: string; role: 'employer' | 'worker' }) => Promise<{ success: boolean; error?: string }>
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  registerWithPhone: (phone: string, password: string, userData: { name: string; role: 'employer' | 'worker' }) => Promise<{ success: boolean; error?: string }>
  loginWithPhone: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const currentUser = firebaseAuthService.getCurrentUser()
      if (currentUser) {
        // Convert Firebase User to our User interface
        const userProfile = await firebaseAuthService.getUserProfile(currentUser.uid)
        if (userProfile) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: userProfile.name,
            role: userProfile.role,
            profile: {
              avatar: undefined
            }
          })
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
    } finally {
      setLoading(false)
    }
  }

  const registerWithEmail = async (email: string, password: string, userData: { name: string; role: 'employer' | 'worker' }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const result = await firebaseAuthService.registerWithEmail(email, password, userData)
      
      if (result.success && result.user) {
        setUser({
          uid: result.user.uid,
          email: result.user.email || '',
          name: userData.name,
          role: userData.role,
          profile: {
            avatar: undefined
          }
        })
        toast({
          title: "Account Created",
          description: `Welcome to KaamBazar, ${userData.name}!`,
        })
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const result = await firebaseAuthService.loginWithEmail(email, password)
      
      if (result.success && result.user) {
        const userProfile = await firebaseAuthService.getUserProfile(result.user.uid)
        if (userProfile) {
          setUser({
            uid: result.user.uid,
            email: result.user.email || '',
            name: userProfile.name,
            role: userProfile.role,
            profile: {
              avatar: undefined
            }
          })
          toast({
            title: "Welcome Back!",
            description: `Welcome back, ${userProfile.name}!`,
          })
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        })
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const registerWithPhone = async (phone: string, password: string, userData: { name: string; role: 'employer' | 'worker' }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const result = await firebaseAuthService.registerWithPhone(phone, password, userData)
      
      if (result.success && result.user) {
        setUser({
          uid: result.user.uid,
          email: result.user.email || '',
          name: userData.name,
          role: userData.role,
          profile: {
            avatar: undefined
          }
        })
        toast({
          title: "Account Created",
          description: `Welcome to KaamBazar, ${userData.name}!`,
        })
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const loginWithPhone = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const result = await firebaseAuthService.loginWithPhone(phone, password)
      
      if (result.success && result.user) {
        const userProfile = await firebaseAuthService.getUserProfile(result.user.uid)
        if (userProfile) {
          setUser({
            uid: result.user.uid,
            email: result.user.email || '',
            name: userProfile.name,
            role: userProfile.role,
            profile: {
              avatar: undefined
            }
          })
          toast({
            title: "Welcome Back!",
            description: `Welcome back, ${userProfile.name}!`,
          })
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid phone or password",
          variant: "destructive",
        })
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await firebaseAuthService.signOut()
      setUser(null)
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No user logged in" }
    }

    try {
      // For development, just update local state
      setUser({ ...user, ...updates })
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update profile"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return { success: false, error: errorMessage }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    registerWithEmail,
    loginWithEmail,
    registerWithPhone,
    loginWithPhone,
    signOut,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
