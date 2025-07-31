// PRODUCTION: Enhanced Profile Service - Rebuilt for better reliability
export class ProfileService {
  static async getSupabaseClient() {
    try {
      const { supabase } = await import('../config/supabase.js')
      return supabase
    } catch (error) {
      console.error('Failed to load Supabase client:', error)
      throw new Error('Database connection failed')
    }
  }

  // PRODUCTION: Check if user exists with enhanced error handling
  static async checkUserExists(email) {
    try {
      console.log('👤 Checking if user exists:', email)
      const supabase = await this.getSupabaseClient()
      
      // Check in user profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles_rg2024')
        .select('id, email, full_name, email_verified, status')
        .eq('email', email.toLowerCase())
        .limit(1)
      
      if (profileError) {
        console.error('❌ Profile check error:', profileError)
        throw new Error('Failed to check user existence')
      }
      
      if (profiles && profiles.length > 0) {
        const profile = profiles[0]
        console.log('✅ User found in profiles:', profile.email, 'verified:', profile.email_verified)
        
        return {
          exists: true,
          emailVerified: profile.email_verified || false,
          fullName: profile.full_name,
          authId: profile.id,
          status: profile.status
        }
      }
      
      console.log('❌ User not found in profiles')
      return {
        exists: false,
        emailVerified: false
      }
      
    } catch (error) {
      console.error('💥 User existence check failed:', error)
      return {
        exists: false,
        emailVerified: false,
        error: error.message
      }
    }
  }

  // PRODUCTION: Create user profile with enhanced validation
  static async createUserProfile(profileData) {
    try {
      console.log('📝 Creating user profile...', profileData.email)
      const supabase = await this.getSupabaseClient()
      
      // Check if this is the first user (admin check)
      let isFirstUser = false
      if (profileData.email !== 'hoxs@regravity.net') {
        const { count, error: countError } = await supabase
          .from('user_profiles_rg2024')
          .select('*', { count: 'exact', head: true })
        
        if (!countError) {
          isFirstUser = count === 0
          console.log('👤 User count:', count, 'Is first user:', isFirstUser)
        }
      }

      const finalAccountType = isFirstUser ? 'admin' : profileData.account_type

      const insertData = {
        id: profileData.id,
        user_id: profileData.user_id,
        email: profileData.email.toLowerCase(),
        full_name: profileData.full_name,
        phone: profileData.phone || '',
        company_name: profileData.company_name || 'Company',
        account_type: finalAccountType,
        chinese_company_name: profileData.chinese_company_name || null,
        business_license: profileData.business_license || null,
        official_address: profileData.official_address || null,
        wechat_id: profileData.wechat_id || null,
        status: 'active',
        email_verified: profileData.email === 'hoxs@regravity.net' ? true : false, // Auto-verify admin
        verification_method: profileData.email === 'hoxs@regravity.net' ? 'manual_admin' : 'pending',
        supplier_status: finalAccountType === 'supplier' ? 'pending_verification' : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation error:', error)
        throw error
      }

      console.log('✅ Profile created successfully')
      if (isFirstUser) {
        console.log('🔑 First user became admin!')
      }

      return { data, error: null }

    } catch (error) {
      console.error('💥 Profile creation failed:', error)
      return { data: null, error }
    }
  }

  // PRODUCTION: Get user profile with better error handling
  static async getUserProfile(userId) {
    try {
      console.log('📊 Getting user profile...', userId)
      const supabase = await this.getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('id', userId)

      if (error) {
        console.error('❌ Profile fetch error:', error)
        throw error
      }

      // Handle multiple profiles case - prefer admin account
      if (data && data.length > 1) {
        console.log('⚠️ Multiple profiles found, selecting admin profile...')
        
        // Look for admin profile first
        const adminProfile = data.find(profile => profile.account_type === 'admin')
        if (adminProfile) {
          console.log('✅ Selected admin profile')
          
          // Clean up duplicate profiles (keep only admin)
          const duplicateIds = data.filter(p => p.id !== adminProfile.id).map(p => p.id)
          if (duplicateIds.length > 0) {
            console.log('🧹 Cleaning up duplicate profiles...')
            await supabase
              .from('user_profiles_rg2024')
              .delete()
              .in('id', duplicateIds)
          }
          
          return { data: adminProfile, error: null }
        }
        
        // Otherwise, take the most recent one
        const latestProfile = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        console.log('✅ Selected most recent profile')
        
        // Clean up older profiles
        const duplicateIds = data.filter(p => p.id !== latestProfile.id).map(p => p.id)
        if (duplicateIds.length > 0) {
          console.log('🧹 Cleaning up duplicate profiles...')
          await supabase
            .from('user_profiles_rg2024')
            .delete()
            .in('id', duplicateIds)
        }
        
        return { data: latestProfile, error: null }
      }

      if (data && data.length === 1) {
        console.log('✅ Profile retrieved successfully')
        return { data: data[0], error: null }
      }

      if (!data || data.length === 0) {
        console.log('❌ No profile found')
        throw new Error('Profile not found')
      }

    } catch (error) {
      console.error('💥 Profile fetch failed:', error)
      return { data: null, error }
    }
  }

  // PRODUCTION: Update user profile
  static async updateUserProfile(userId, updates) {
    try {
      console.log('📝 Updating user profile...', userId)
      const supabase = await this.getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile update error:', error)
        throw error
      }

      console.log('✅ Profile updated successfully')
      return { data, error: null }

    } catch (error) {
      console.error('💥 Profile update failed:', error)
      return { data: null, error }
    }
  }

  // PRODUCTION: Get public suppliers
  static async getPublicSuppliers() {
    try {
      console.log('📋 Fetching public suppliers...')
      const supabase = await this.getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .select('id, company_name, chinese_company_name, user_id, supplier_status')
        .eq('account_type', 'supplier')
        .eq('status', 'active')
        .in('supplier_status', ['verified', 'trusted'])

      if (error) {
        console.error('❌ Suppliers fetch error:', error)
        throw error
      }

      console.log('✅ Suppliers fetched:', data?.length || 0)
      return { data: data || [], error: null }

    } catch (error) {
      console.error('💥 Suppliers fetch failed:', error)
      return { data: [], error }
    }
  }

  // PRODUCTION: Check email exists
  static async checkEmailExists(email) {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1)

      if (error) {
        console.error('Email check error:', error)
        return false
      }

      return data && data.length > 0

    } catch (error) {
      console.error('Email check failed:', error)
      return false
    }
  }
}