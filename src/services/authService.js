import { ProfileService } from './profileService.js'
import { generateBuyerId, generateSupplierId } from '../utils/idGenerator.js'
import { EmailService } from './emailService.js'

export class AuthService {
  static async getSupabaseClient() {
    try {
      const { supabase } = await import('../config/supabase.js')
      return supabase
    } catch (error) {
      console.error('Failed to load Supabase client:', error)
      throw new Error('Authentication service unavailable')
    }
  }

  // Enhanced login that handles admin accounts properly
  static async simpleLogin(email, password) {
    try {
      console.log('🔑 Starting simple login...', email)
      const supabase = await this.getSupabaseClient()

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (loginError) {
        throw new Error(`Login failed: ${loginError.message}`)
      }

      if (!loginData.user) {
        throw new Error('No user data returned')
      }

      console.log('✅ Login successful for user:', loginData.user.id)

      // Load profile with enhanced error handling for admin
      let profileResult = await ProfileService.getUserProfile(loginData.user.id)

      // If profile not found and this is the admin email, handle it
      if (profileResult.error && email === 'hoxs@regravity.net') {
        console.log('🔧 Admin profile issue, checking for existing profile...')

        // Check if there's an existing admin profile with different auth ID
        const { data: existingProfiles } = await supabase
          .from('user_profiles_rg2024')
          .select('*')
          .eq('email', 'hoxs@regravity.net')

        if (existingProfiles && existingProfiles.length > 0) {
          // Update existing profile to match current auth user ID
          console.log('🔧 Updating existing admin profile with correct auth ID...')
          const existingProfile = existingProfiles[0]

          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles_rg2024')
            .update({
              id: loginData.user.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', 'hoxs@regravity.net')
            .select()
            .single()

          if (updateError) {
            console.error('❌ Failed to update admin profile:', updateError)
            // If update fails, try to create new one with unique user_id
            return await this.createFreshAdminProfile(supabase, loginData.user.id)
          }

          console.log('✅ Admin profile updated successfully')
          profileResult = { data: updatedProfile, error: null }
        } else {
          // Create new admin profile
          return await this.createFreshAdminProfile(supabase, loginData.user.id)
        }
      }

      if (profileResult.error) {
        throw new Error(`Profile loading failed: ${profileResult.error.message}`)
      }

      return {
        success: true,
        message: 'Login successful!',
        shouldRedirectToDashboard: true,
        data: {
          user: loginData.user,
          profile: profileResult.data
        }
      }
    } catch (error) {
      console.error('💥 Login failed:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  static async createFreshAdminProfile(supabase, authUserId) {
    try {
      console.log('🔧 Creating fresh admin profile...')

      // Generate unique user_id for admin
      const uniqueAdminId = 'ADM' + Date.now().toString().slice(-6)

      const adminProfileData = {
        id: authUserId,
        user_id: uniqueAdminId,
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

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles_rg2024')
        .insert([adminProfileData])
        .select()
        .single()

      if (createError) {
        throw new Error(`Fresh admin profile creation failed: ${createError.message}`)
      }

      console.log('✅ Fresh admin profile created successfully')

      return {
        success: true,
        message: 'Admin login successful!',
        shouldRedirectToDashboard: true,
        data: {
          user: { id: authUserId },
          profile: newProfile
        }
      }
    } catch (error) {
      throw new Error(`Fresh admin profile creation failed: ${error.message}`)
    }
  }

  // ENHANCED: Simplified registration with robust email notifications
  static async simpleRegistration(formData) {
    try {
      console.log('🔐 Starting enhanced registration with robust notifications...', formData.email)
      const supabase = await this.getSupabaseClient()

      // Generate user ID
      const userId = formData.accountType === 'buyer' ? generateBuyerId() : generateSupplierId()

      // Create auth user with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // DISABLE email confirmation
          emailRedirectTo: null,
          data: {
            full_name: formData.fullName,
            account_type: formData.accountType,
            user_id: userId,
            email_confirm: true // Force confirmed
          }
        }
      })

      if (authError) {
        throw new Error(`Registration failed: ${authError.message}`)
      }

      if (!authData?.user?.id) {
        throw new Error('No user ID returned from registration')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Create profile directly
      const profileData = {
        id: authData.user.id,
        user_id: userId,
        email: formData.email.toLowerCase(),
        full_name: formData.fullName,
        phone: formData.phone,
        company_name: formData.companyName,
        account_type: formData.accountType,
        chinese_company_name: formData.chineseCompanyName || null,
        business_license: formData.businessLicense || null,
        official_address: formData.officialAddress || null,
        wechat_id: formData.wechatId || null,
        status: 'active',
        email_verified: true, // Force verified
        verification_method: 'auto_confirmed'
      }

      const profileResult = await ProfileService.createUserProfile(profileData)

      if (profileResult.error) {
        console.error('❌ Profile creation failed:', profileResult.error)
        throw new Error(`Profile creation failed: ${profileResult.error.message}`)
      }

      console.log('✅ Profile created successfully')

      // ENHANCED: Send welcome email with robust delivery
      try {
        console.log('📧 Sending registration welcome email with robust delivery...')
        await EmailService.sendRegistrationNotification({
          email: formData.email,
          fullName: formData.fullName,
          companyName: formData.companyName,
          accountType: formData.accountType
        })
        console.log('✅ Welcome email sent successfully')
      } catch (emailError) {
        console.warn('⚠️ Welcome email failed, but registration succeeded:', emailError.message)
        // Don't fail registration if welcome email fails
      }

      // Immediately sign in
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) {
        console.warn('⚠️ Immediate login failed, but registration succeeded')
        return {
          success: true,
          message: 'Registration successful! Please login.',
          needsLogin: true
        }
      }

      return {
        success: true,
        message: 'Registration and login successful!',
        shouldRedirectToDashboard: true,
        data: {
          user: loginData.user,
          profile: profileResult.data
        }
      }
    } catch (error) {
      console.error('💥 Registration failed:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}