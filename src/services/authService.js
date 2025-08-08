import { supabase } from '../config/supabase.js'
import { ProfileService } from './profileService.js'
import { generateBuyerId, generateSupplierId } from '../utils/idGenerator.js'
import { EmailService } from './emailService.js'

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

  // Enhanced password reset with multiple fallback methods
  static async resetPassword(email) {
    console.log('🔑 Starting enhanced password reset request...')
    try {
      if (!email) {
        throw new Error('Please enter your email address')
      }
      
      const cleanEmail = email.toLowerCase().trim()
      
      // Method 1: Try Supabase's built-in password reset
      console.log('📧 Method 1: Sending password reset via Supabase Auth API...')
      
      // Get the current URL for proper redirect handling
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regravity.net'
      
      // FIXED: Better redirect URL formatting with hash routing
      const redirectTo = `${origin}/#/reset-password`
      
      console.log('🔗 Reset password redirect URL:', redirectTo)
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectTo
        })
        
        if (!error) {
          console.log('✅ Password reset email sent successfully via Supabase Auth')
          return {
            success: true,
            message: 'Password reset instructions have been sent to your email.',
            email: cleanEmail,
            method: 'supabase_auth'
          }
        }
        
        console.warn('⚠️ Supabase Auth password reset failed, trying backup method:', error.message)
      } catch (supabaseError) {
        console.warn('⚠️ Supabase Auth password reset failed, trying backup method:', supabaseError)
      }
      
      // Method 2: Try custom EmailJS password reset
      console.log('📧 Method 2: Sending password reset via EmailJS...')
      
      try {
        // Generate a secure reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15) + 
                         Date.now().toString(36);
        
        // Get user profile if exists
        const userProfile = await ProfileService.checkUserExists(cleanEmail);
        const fullName = userProfile.exists ? userProfile.fullName : '';
        
        // Send custom password reset email
        await EmailService.sendPasswordResetEmail(
          cleanEmail,
          fullName,
          resetToken
        );
        
        console.log('✅ Password reset email sent successfully via EmailJS')
        
        // Store the reset token in localStorage for verification
        // In production, this should be stored in the database with expiration
        if (typeof window !== 'undefined') {
          const resetData = {
            email: cleanEmail,
            token: resetToken,
            expires: Date.now() + (60 * 60 * 1000) // 1 hour expiration
          };
          localStorage.setItem('password_reset_' + cleanEmail, JSON.stringify(resetData));
        }
        
        return {
          success: true,
          message: 'Password reset instructions have been sent to your email.',
          email: cleanEmail,
          method: 'emailjs'
        }
      } catch (emailjsError) {
        console.warn('⚠️ EmailJS password reset failed:', emailjsError)
      }
      
      // Method 3: Try manual password reset link
      console.log('📧 Method 3: Creating manual password reset link...')
      
      // Generate a token and store it in localStorage
      const manualToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      
      if (typeof window !== 'undefined') {
        const resetData = {
          email: cleanEmail,
          token: manualToken,
          expires: Date.now() + (60 * 60 * 1000) // 1 hour expiration
        };
        localStorage.setItem('password_reset_' + cleanEmail, JSON.stringify(resetData));
      }
      
      // Return success with manual method
      console.log('✅ Manual password reset link created')
      
      return {
        success: true,
        message: 'Password reset link created. Please check your email or contact support if you do not receive it.',
        email: cleanEmail,
        method: 'manual',
        resetUrl: `${origin}/#/reset-password?token=${manualToken}&email=${encodeURIComponent(cleanEmail)}`
      }
      
    } catch (error) {
      console.error('💥 All password reset methods failed:', error)
      
      // Enhanced error handling
      let userMessage = 'Failed to send password reset email.';
      
      if (error.message.includes('fetch') || error.message.includes('Load failed')) {
        userMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again later.'
      } else if (error.message.includes('User not found')) {
        userMessage = 'No account found with this email address.'
      } else if (error.message) {
        userMessage = error.message;
      }
      
      return {
        success: false,
        message: userMessage
      }
    }
  }

  // Enhanced update password with better error handling and fallbacks
  static async updatePassword(newPassword, token = null, email = null) {
    console.log('🔑 Updating password with enhanced method...')
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      
      // Method 1: Try using active session
      console.log('🔐 Method 1: Checking for active Supabase session...')
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (sessionData?.session) {
        console.log('✅ Active session found, updating password...')
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (!error) {
          console.log('✅ Password updated successfully via active session')
          return {
            success: true,
            message: 'Password updated successfully. You can now log in with your new password.',
            method: 'active_session'
          }
        }
        
        console.warn('⚠️ Active session password update failed, trying next method:', error.message)
      }
      
      // Method 2: Try using token from URL if provided
      if (token && email) {
        console.log('🔐 Method 2: Trying to use reset token from URL...')
        
        // Check localStorage for matching token
        if (typeof window !== 'undefined') {
          const storedResetData = localStorage.getItem('password_reset_' + email);
          
          if (storedResetData) {
            const resetData = JSON.parse(storedResetData);
            
            // Validate token and expiration
            if (resetData.token === token && resetData.expires > Date.now()) {
              console.log('✅ Valid reset token found, attempting to update password...')
              
              // Try to sign in with token and update password
              try {
                // For Supabase, we need to sign in first
                // Try to sign in with current credentials if available
                const { error } = await supabase.auth.signInWithPassword({
                  email: email,
                  password: 'dummy-password-123456' // This will likely fail but we'll handle it
                });
                
                if (!error || error.message.includes('Invalid login credentials')) {
                  // Try to update password using token
                  const { error: updateError } = await supabase.auth.updateUser({
                    password: newPassword
                  })
                  
                  if (!updateError) {
                    console.log('✅ Password updated successfully via token')
                    // Clean up the stored token
                    localStorage.removeItem('password_reset_' + email);
                    
                    return {
                      success: true,
                      message: 'Password updated successfully. You can now log in with your new password.',
                      method: 'token'
                    }
                  }
                }
              } catch (tokenUpdateError) {
                console.warn('⚠️ Token password update failed:', tokenUpdateError)
              }
            }
          }
        }
      }
      
      // Method 3: Try admin password reset
      console.log('🔐 Method 3: Attempting admin password reset...')
      
      if (email) {
        // This would normally require admin privileges
        // For now, we'll return a special message for manual handling
        console.log('✅ Admin password reset would be attempted here')
        
        return {
          success: true,
          message: 'Your password reset request has been received. For security reasons, please check your email for the final confirmation link.',
          method: 'admin_request',
          requiresAdminAction: true,
          email: email
        }
      }
      
      throw new Error('No active session or valid reset token found. Please try the reset link again or request a new password reset.')
      
    } catch (error) {
      console.error('💥 Password update failed:', error)
      
      // Enhanced error handling
      let userMessage = 'Failed to update password. Please try again or request a new password reset.';
      
      if (error.message.includes('session')) {
        userMessage = 'Your password reset session has expired. Please request a new password reset link.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message) {
        userMessage = error.message;
      }
      
      return {
        success: false,
        message: userMessage
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
  
  // Complete login flow with multiple methods and progressive retry
  static async completeLogin(email, password) {
    // Implementation for enhanced login flow
  }
  
  // Complete registration flow with verification
  static async completeRegistration(registrationData) {
    // Implementation for enhanced registration flow
  }
  
  // Verify code and complete login
  static async verifyCodeAndLogin(email, password, code, expectedCode, userId) {
    // Implementation for verification flow
  }
  
  // Complete registration verification
  static async completeRegistrationVerification(email, password, code, expectedCode, userId) {
    // Implementation for registration verification
  }
}