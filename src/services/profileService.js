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

  static async createUserProfile(profileData) {
    try {
      console.log('📝 Creating user profile...', profileData.email)
      const supabase = await this.getSupabaseClient()

      // Check if this is the first user (but skip if this is the admin we just created)
      let isFirstUser = false
      if (profileData.email !== 'hoxs@regravity.net') {
        const { count, error: countError } = await supabase
          .from('user_profiles_rg2024')
          .select('*', { count: 'exact', head: true })
        
        isFirstUser = count === 0
        console.log('👤 User count:', count, 'Is first user:', isFirstUser)
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

  static async isFirstUser() {
    try {
      const supabase = await this.getSupabaseClient()
      const { count, error } = await supabase
        .from('user_profiles_rg2024')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('First user check error:', error)
        return false
      }

      // Return true only if count is 0 (no users) or 1 (only admin exists)
      return count <= 1
    } catch (error) {
      console.error('First user check failed:', error)
      return false
    }
  }

  // New method to fix admin profile specifically
  static async ensureAdminProfile() {
    try {
      console.log('🔧 Ensuring admin profile exists...')
      const supabase = await this.getSupabaseClient()

      // Check if admin profile exists
      const { data: adminProfiles, error: checkError } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('email', 'hoxs@regravity.net')

      if (checkError) {
        console.error('Admin check error:', checkError)
        return { success: false, error: checkError }
      }

      if (adminProfiles && adminProfiles.length > 0) {
        console.log('✅ Admin profile already exists')
        return { success: true, data: adminProfiles[0] }
      }

      // Get auth user ID
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', 'hoxs@regravity.net')
        .limit(1)

      if (authError || !authUsers || authUsers.length === 0) {
        console.error('Auth user not found for admin')
        return { success: false, error: 'Auth user not found' }
      }

      // Create admin profile
      const adminData = {
        id: authUsers[0].id,
        user_id: 'ADM001HOXS',
        email: 'hoxs@regravity.net',
        full_name: 'Hoxs Admin',
        phone: '+852-1234-5678',
        company_name: 'Regravity Ltd',
        account_type: 'admin',
        status: 'active',
        email_verified: true,
        verification_method: 'manual_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newAdmin, error: createError } = await supabase
        .from('user_profiles_rg2024')
        .insert([adminData])
        .select()
        .single()

      if (createError) {
        console.error('Admin creation error:', createError)
        return { success: false, error: createError }
      }

      console.log('✅ Admin profile created successfully')
      return { success: true, data: newAdmin }

    } catch (error) {
      console.error('💥 Admin profile setup failed:', error)
      return { success: false, error }
    }
  }
}