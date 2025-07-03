import { createClient } from '@supabase/supabase-js'

// Direct configuration (no environment variables)
const supabaseUrl = 'https://ziatqeyfcafhaswxhnzu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXRxZXlmY2FmaGFzd3hobnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjI0MzksImV4cCI6MjA2NjkzODQzOX0.gfPv1FyyFFsAamgBC2bnlvL-a36LegsoR9u9TyKm6GY'

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing')
  throw new Error('Supabase configuration is required')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // DISABLE email confirmation completely
    confirmEmailRedirectTo: null,
    emailRedirectTo: null
  }
})

// Test connection only in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  supabase.from('user_profiles_rg2024').select('count', { count: 'exact', head: true })
    .then(() => console.log('✅ Supabase connected'))
    .catch(error => console.warn('⚠️ Supabase connection issue:', error.message))
}

export default supabase