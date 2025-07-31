import { createClient } from '@supabase/supabase-js'

// PRODUCTION: Hardcoded configuration for reliability
const supabaseUrl = 'https://ziatqeyfcafhaswxhnzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXRxZXlmY2FmaGFzd3hobnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjI0MzksImV4cCI6MjA2NjkzODQzOX0.gfPv1FyyFFsAamgBC2bnlvL-a36LegsoR9u9TyKm6GY'

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing')
  throw new Error('Database configuration is required')
}

// PRODUCTION: Optimized client configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PRODUCTION: Configure for regravity.net
    redirectTo: typeof window !== 'undefined' ? window.location.origin + '/#/dashboard' : 'https://regravity.net/#/dashboard',
    // Disable built-in email confirmation - we use EmailJS
    confirmEmailRedirectTo: null,
    emailRedirectTo: null,
  },
  // PRODUCTION: Enhanced connection settings
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'regravity-production'
    }
  }
})

// PRODUCTION: Connection test with error handling
if (typeof window !== 'undefined') {
  // Test connection only in browser
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.warn('⚠️ Supabase connection warning:', error.message)
      } else {
        console.log('✅ Supabase connected to production database')
      }
    } catch (err) {
      console.warn('⚠️ Supabase connection test failed:', err.message)
    }
  }
  
  // Test connection with delay to avoid blocking app startup
  setTimeout(testConnection, 1000)
}

export default supabase