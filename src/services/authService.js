import { supabase } from '../config/supabase.js'
import { ProfileService } from './profileService.js'
import { generateBuyerId, generateSupplierId } from '../utils/idGenerator.js'

export class AuthService {
  // Standard registration with Supabase email confirmation
  static async registerUser(registrationData) {
    console.log('🔐 Starting user registration...')
    try {
      // Validate input data
      if (!registrationData.email || !registrationData.password || !registrationData.fullName || !registrationData.companyName) {
        throw new Error('Please fill in all required fields')
      }
      
      if (registrationData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      
      const email = registrationData.email.toLowerCase().trim()
      
      // Check if user already exists
      console.log('👤 Checking if user already exists...')
      const existingProfile = await ProfileService.checkUserExists(email)
      
      if (existingProfile.exists) {
        throw new Error('An account with this email already exists. Please try logging in instead.')
      }
      
      // Generate user ID
      const userId = registrationData.accountType === 'buyer' ? generateBuyerId() : generateSupplierId()
      
      // Create Supabase auth user (with email confirmation)
      console.log('🔑 Creating Supabase auth user with email confirmation...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: registrationData.password,
        options: {
          data: {
            full_name: registrationData.fullName,
            account_type: registrationData.accountType,
            user_id: userId
          }
        }
      })
      
      if (authError) {
        console.error('❌ Supabase auth error:', authError)
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in.')
        } else if (authError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.')
        } else {
          throw new Error(`Registration failed: ${authError.message}`)
        }
      }
      
      if (!authData?.user?.id) {
        throw new Error('Failed to create user account')
      }
      
      console.log('✅ Supabase auth user created:', authData.user.id)
      
      // Create user profile
      console.log('📝 Creating user profile...')
      const profileData = {
        id: authData.user.id,
        user_id: userId,
        email: email,
        full_name: registrationData.fullName,
        phone: registrationData.phone || '',
        company_name: registrationData.companyName,
        account_type: registrationData.accountType,
        chinese_company_name: registrationData.chineseCompanyName || null,
        business_license: registrationData.businessLicense || null,
        official_address: registrationData.officialAddress || null,
        wechat_id: registrationData.wechatId || null,
        status: 'active',
        email_verified: false, // Will be set to true after email confirmation
        verification_method: 'supabase_email',
        supplier_status: registrationData.accountType === 'supplier' ? 'pending_verification' : null
      }
      
      const profileResult = await ProfileService.createUserProfile(profileData)
      
      if (profileResult.error) {
        console.error('❌ Profile creation failed:', profileResult.error)
        // Clean up auth user if profile creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
          console.log('🧹 Cleaned up auth user after profile failure')
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup auth user:', cleanupError)
        }
        throw new Error(`Failed to create user profile: ${profileResult.error.message}`)
      }
      
      console.log('✅ User profile created successfully')
      
      return {
        success: true,
        message: 'Registration successful! Please check your email for a confirmation link to verify your account.',
        email: email,
        userId: authData.user.id,
        data: {
          user: authData.user,
          profile: profileResult.data
        }
      }
    } catch (error) {
      console.error('💥 Registration failed:', error)
      // Enhanced error handling
      let userMessage = error.message
      
      if (error.message.includes('fetch') || error.message.includes('Load failed')) {
        userMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.'
      }
      
      return {
        success: false,
        message: userMessage
      }
    }
  }

  // Standard login with Supabase
  static async loginUser(email, password) {
    console.log('🔑 Starting user login...')
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }
      
      const cleanEmail = email.toLowerCase().trim()
      
      // Attempt Supabase login
      console.log('🔐 Attempting Supabase login...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      })
      
      if (loginError) {
        console.error('❌ Supabase login error:', loginError)
        
        if (loginError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (loginError.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Your email is not verified yet. Please check your inbox for a confirmation email.',
            needsEmailConfirmation: true,
            email: cleanEmail
          }
        } else {
          throw new Error(`Login failed: ${loginError.message}`)
        }
      }
      
      if (!loginData.user) {
        throw new Error('Login failed: No user data returned')
      }
      
      console.log('✅ Supabase login successful:', loginData.user.id)
      
      // Load user profile
      console.log('📊 Loading user profile...')
      const profileResult = await ProfileService.getUserProfile(loginData.user.id)
      
      if (profileResult.error) {
        console.error('❌ Failed to load profile:', profileResult.error)
        throw new Error('Failed to load user profile. Please contact support.')
      }
      
      // Update email verified status if needed
      if (loginData.user.email_confirmed_at && !profileResult.data.email_verified) {
        await ProfileService.updateUserProfile(loginData.user.id, {
          email_verified: true,
          verification_method: 'supabase_email',
          verified_at: new Date().toISOString()
        });
      }
      
      console.log('🎉 Login successful!')
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
      // Enhanced error handling
      let userMessage = error.message
      
      if (error.message.includes('fetch') || error.message.includes('Load failed')) {
        userMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.'
      }
      
      return {
        success: false,
        message: userMessage
      }
    }
  }

  // Standard password reset with Supabase
  static async resetPassword(email) {
    console.log('🔑 Starting password reset request...')
    try {
      if (!email) {
        throw new Error('Please enter your email address')
      }
      
      const cleanEmail = email.toLowerCase().trim()
      
      // Use Supabase's built-in password reset
      console.log('📧 Sending password reset email via Supabase...')
      
      // Get the current URL for proper redirect handling
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regravity.net'
      
      // FIXED: Better redirect URL formatting
      const redirectTo = `${origin}/#/reset-password`
      
      console.log('🔗 Reset password redirect URL:', redirectTo)
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectTo
      })
      
      if (error) {
        console.error('❌ Password reset error:', error)
        throw new Error(`Failed to send password reset email: ${error.message}`)
      }
      
      console.log('✅ Password reset email sent successfully')
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
        email: cleanEmail
      }
    } catch (error) {
      console.error('💥 Password reset request failed:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Update password after reset
  static async updatePassword(newPassword) {
    console.log('🔑 Updating password...')
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        console.error('❌ Password update error:', error)
        throw new Error(`Failed to update password: ${error.message}`)
      }
      
      console.log('✅ Password updated successfully')
      return {
        success: true,
        message: 'Password updated successfully. You can now log in with your new password.'
      }
    } catch (error) {
      console.error('💥 Password update failed:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  // Resend confirmation email
  static async resendConfirmationEmail(email) {
    console.log('📧 Resending confirmation email...')
    try {
      if (!email) {
        throw new Error('Please enter your email address')
      }
      
      const cleanEmail = email.toLowerCase().trim()
      
      // Get the current URL for proper redirect handling
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regravity.net'
      const redirectTo = `${origin}/#/auth/callback`
      
      // Use Supabase's resend confirmation
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          redirectTo: redirectTo
        }
      })
      
      if (error) {
        console.error('❌ Resend confirmation failed:', error)
        throw error
      }
      
      return {
        success: true,
        message: 'Confirmation email sent! Please check your inbox.'
      }
    } catch (error) {
      console.error('❌ Failed to resend confirmation email:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}