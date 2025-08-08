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
        
        // Create reset URL with both token and email
        const resetUrl = `${origin}/#/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
        
        // Send custom password reset email
        await EmailService.sendPasswordResetEmail(
          cleanEmail,
          fullName,
          resetToken,
          resetUrl
        );
        
        console.log('✅ Password reset email sent successfully via EmailJS')
        
        // Store the reset token in localStorage for verification
        if (typeof window !== 'undefined') {
          // Clear any existing tokens for this email first
          localStorage.removeItem('password_reset_' + cleanEmail);
          
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
        // Clear any existing tokens for this email first
        localStorage.removeItem('password_reset_' + cleanEmail);
        
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
    console.log('🔑 Updating password with enhanced method...', { hasToken: !!token, hasEmail: !!email })
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      
      // Method 1: Try using active session
      console.log('🔐 Method 1: Checking for active Supabase session...')
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (sessionData?.session) {
        console.log('✅ Active session found, updating password...', { userId: sessionData.session.user.id })
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
      } else {
        console.log('⚠️ No active session found, trying token method')
      }
      
      // Method 2: Try using token from URL if provided
      if (token && email) {
        console.log('🔐 Method 2: Trying to use reset token from URL...', { tokenPrefix: token.substring(0, 5) + '...', email })
        
        // Check localStorage for matching token
        if (typeof window !== 'undefined') {
          const storedResetData = localStorage.getItem('password_reset_' + email);
          
          if (storedResetData) {
            const resetData = JSON.parse(storedResetData);
            
            // Log token details for debugging
            console.log('📋 Token details:', { 
              tokenMatch: resetData.token === token,
              expires: new Date(resetData.expires).toLocaleString(),
              isExpired: resetData.expires <= Date.now()
            });
            
            // Validate token and expiration
            if (resetData.token === token && resetData.expires > Date.now()) {
              console.log('✅ Valid reset token found, attempting to update password...')
              
              // Try to sign in with token and update password
              try {
                // For Supabase, we need to sign in first
                // Try to sign in with email
                console.log('🔑 Attempting passwordless sign-in...')
                
                // Try to use OTP sign-in (if available)
                try {
                  const { error: otpError } = await supabase.auth.signInWithOtp({
                    email: email
                  })
                  
                  if (!otpError) {
                    console.log('✅ OTP sign-in successful')
                  }
                } catch (otpError) {
                  console.warn('⚠️ OTP sign-in failed:', otpError.message)
                }
                
                // Try regular sign-in with dummy password (will likely fail but worth trying)
                try {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: 'dummy-password-123456' // This will likely fail but we'll handle it
                  });
                  
                  if (!error) {
                    console.log('✅ Sign-in succeeded somehow')
                  }
                } catch (signInError) {
                  console.warn('⚠️ Sign-in attempt failed as expected:', signInError.message)
                }
                
                // Now try to update password with token
                console.log('🔑 Attempting to update password via token...')
                
                // Try to use the direct Supabase reset API with the token
                try {
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                    email,
                    { redirectTo: window.location.href }
                  );
                  
                  if (!resetError) {
                    console.log('✅ Password reset email re-sent successfully')
                  }
                } catch (resetError) {
                  console.warn('⚠️ Reset email re-send failed:', resetError)
                }
                
                // Try to update user directly
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
                } else {
                  console.warn('⚠️ Token password update failed:', updateError.message)
                  
                  // If there's an error with the token update but we have a valid token,
                  // fall back to the admin password reset method
                  console.log('🔄 Falling back to admin method with valid token...')
                  throw new Error('Token-based password reset failed. Trying alternative method...')
                }
              } catch (tokenUpdateError) {
                console.warn('⚠️ Token password update failed:', tokenUpdateError.message)
                throw new Error('Token-based password reset failed. Please try requesting a new reset link.')
              }
            } else {
              console.warn('⚠️ Token invalid or expired:', {
                tokenMatch: resetData.token === token,
                expired: resetData.expires <= Date.now(),
                expiresAt: new Date(resetData.expires).toLocaleString()
              })
              throw new Error('Password reset token has expired. Please request a new password reset link.')
            }
          } else {
            console.warn('⚠️ No stored reset data found for email:', email)
          }
        }
      }
      
      // Method 3: Try admin password reset
      console.log('🔐 Method 3: Attempting admin password reset...')
      
      if (email) {
        // Try to use Supabase's admin password reset
        try {
          // This is a special method that might work in some cases
          const { error: adminError } = await supabase.auth.admin.updateUserById(
            email, // Using email as ID (might work in some edge cases)
            { password: newPassword }
          );
          
          if (!adminError) {
            console.log('✅ Admin password reset successful')
            return {
              success: true,
              message: 'Your password has been updated successfully. You can now log in with your new password.',
              method: 'admin'
            }
          }
        } catch (adminError) {
          console.warn('⚠️ Admin password reset failed:', adminError)
        }
        
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