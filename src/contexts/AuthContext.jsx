import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { supabase } = await import('../config/supabase.js')
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Session check failed:', error)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    let subscription = null
    
    const setupAuthListener = async () => {
      try {
        const { supabase } = await import('../config/supabase.js')
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
          }
        )
        subscription = authSubscription
      } catch (error) {
        console.error('Auth listener setup failed:', error)
      }
    }

    setupAuthListener()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // Legacy signUp for compatibility
  const signUp = async (email, password, userData) => {
    try {
      console.log('🔐 Legacy signUp - use AuthService instead')
      const { supabase } = await import('../config/supabase.js')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: null
        }
      })

      if (error) {
        console.error('❌ Legacy signUp error:', error)
        throw error
      }

      return { data, error: null }

    } catch (error) {
      console.error('💥 Legacy signUp failed:', error)
      return { data: null, error }
    }
  }

  // Legacy signIn for compatibility
  const signIn = async (email, password) => {
    try {
      console.log('🔑 Legacy signIn - use AuthService instead')
      const { supabase } = await import('../config/supabase.js')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Legacy signIn error:', error)
        throw error
      }

      return { data, error: null }

    } catch (error) {
      console.error('💥 Legacy signIn failed:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { supabase } = await import('../config/supabase.js')
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}