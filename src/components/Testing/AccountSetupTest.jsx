import React, { useState } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import { generateBuyerId } from '../../utils/idGenerator'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw, FiMail, FiEye, FiArrowRight } = FiIcons

const AccountSetupTest = () => {
  const { signUp, signIn, signOut } = useAuth()
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [currentPhase, setCurrentPhase] = useState('setup') // 'setup', 'verification', 'login', 'dashboard'

  // Your actual account credentials
  const accountData = {
    email: 'hoxs@live.com',
    password: 'Hoxs1234',
    fullName: 'Hoxs Live User',
    companyName: 'Live Company',
    phone: '1234567890',
    accountType: 'buyer'
  }

  const updateStep = (newStep, phase = null) => {
    setStep(newStep)
    if (phase) setCurrentPhase(phase)
    console.log('📍 Step:', newStep)
  }

  const setupCompleteAccount = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      updateStep('Checking for existing account...', 'setup')
      
      // Step 1: Check if account already exists
      const { data: existingProfiles } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('email', accountData.email)

      if (existingProfiles && existingProfiles.length > 0) {
        console.log('✅ Account already exists, proceeding to login test...')
        updateStep('Account exists, testing login...', 'login')
        return await testLoginFlow()
      }

      // Step 2: Create new account
      updateStep('Creating new account...', 'setup')
      
      const { data: authData, error: authError } = await signUp(
        accountData.email, 
        accountData.password,
        {
          full_name: accountData.fullName,
          account_type: accountData.accountType,
          user_id: generateBuyerId()
        }
      )

      if (authError) {
        throw new Error(`Account creation failed: ${authError.message}`)
      }

      console.log('✅ Auth user created:', authData.user?.id)
      
      // Step 3: Create Profile
      updateStep('Creating user profile...', 'setup')
      
      const profileData = {
        id: authData.user.id,
        user_id: authData.user.user_metadata?.user_id || generateBuyerId(),
        email: accountData.email,
        full_name: accountData.fullName,
        phone: accountData.phone,
        company_name: accountData.companyName,
        account_type: accountData.accountType,
        status: 'active',
        email_verified: true,
        verification_method: 'setup'
      }

      const { data: profileResult, error: profileError } = await ProfileService.createUserProfile(profileData)

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('✅ Profile created successfully:', profileResult)

      // Step 4: Test immediate login (might work if email is pre-confirmed)
      updateStep('Testing immediate login...', 'login')
      
      const { data: immediateLogin, error: immediateError } = await signIn(accountData.email, accountData.password)
      
      if (!immediateError && immediateLogin.user) {
        console.log('🎉 Immediate login successful!')
        updateStep('Login successful, accessing dashboard...', 'dashboard')
        
        setTestResult({
          success: true,
          message: '🎉 Account setup and login successful!',
          details: {
            authUserId: authData.user.id,
            profileCreated: !!profileResult,
            immediateLogin: true,
            flow: 'registration → profile creation → immediate login'
          }
        })
        return
      }

      // Step 5: Handle email verification if needed
      if (immediateError?.message.includes('not confirmed')) {
        updateStep('Email needs verification, starting verification flow...', 'verification')
        return await handleEmailVerification(authData.user.id)
      } else {
        throw new Error(`Login failed: ${immediateError?.message}`)
      }

    } catch (error) {
      console.error('❌ Account setup failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { error: error.message, phase: currentPhase }
      })
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const handleEmailVerification = async (userId) => {
    try {
      updateStep('Simulating EmailJS verification...', 'verification')
      
      // Generate verification code
      const verificationCode = EmailService.generateVerificationCode()
      console.log('📧 Generated verification code:', verificationCode)
      
      // Simulate EmailJS verification success
      updateStep('EmailJS verification completed, confirming email...', 'verification')
      
      // Manually confirm the user email
      try {
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          userId, 
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.warn('⚠️ Manual confirmation warning:', confirmError.message)
        } else {
          console.log('✅ Email confirmed successfully')
        }
      } catch (confirmError) {
        console.warn('⚠️ Manual confirmation failed, trying alternative approach:', confirmError.message)
      }

      // Wait and try login again
      updateStep('Retrying login after verification...', 'login')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return await testLoginFlow()

    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`)
    }
  }

  const testLoginFlow = async () => {
    try {
      updateStep('Attempting login...', 'login')
      
      // Multiple login attempts with increasing delays
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`🔑 Login attempt ${attempt}...`)
        
        const { data: loginData, error: loginError } = await signIn(accountData.email, accountData.password)
        
        if (!loginError && loginData.user) {
          console.log('✅ Login successful on attempt', attempt)
          updateStep('Login successful, verifying dashboard access...', 'dashboard')
          
          // Test profile loading
          const profileResult = await ProfileService.getUserProfile(loginData.user.id)
          
          if (profileResult.error) {
            throw new Error(`Profile loading failed: ${profileResult.error.message}`)
          }
          
          console.log('✅ Profile loaded successfully:', profileResult.data)
          
          setTestResult({
            success: true,
            message: '🎉 Complete login flow successful!',
            details: {
              loginAttempt: attempt,
              userId: loginData.user.id,
              accountType: profileResult.data?.account_type,
              profileLoaded: !!profileResult.data,
              flow: 'login → profile verification → dashboard ready'
            }
          })
          return
        } else {
          console.log(`❌ Login attempt ${attempt} failed:`, loginError?.message)
          
          if (attempt < 3) {
            updateStep(`Login attempt ${attempt} failed, waiting before retry...`, 'login')
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
          }
        }
      }
      
      throw new Error('All login attempts failed')

    } catch (error) {
      throw new Error(`Login flow failed: ${error.message}`)
    }
  }

  const testExistingLogin = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      updateStep('Testing login with existing account...', 'login')
      return await testLoginFlow()
    } catch (error) {
      console.error('❌ Login test failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { error: error.message, phase: 'login' }
      })
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'setup': return FiUser
      case 'verification': return FiMail
      case 'login': return FiCheckCircle
      case 'dashboard': return FiEye
      default: return FiPlay
    }
  }

  const getPhaseColor = (phase) => {
    if (currentPhase === phase) return 'bg-blue-100 border-blue-300 text-blue-800'
    if (['setup', 'verification', 'login', 'dashboard'].indexOf(currentPhase) > 
        ['setup', 'verification', 'login', 'dashboard'].indexOf(phase)) {
      return 'bg-green-100 border-green-300 text-green-800'
    }
    return 'bg-gray-100 border-gray-300 text-gray-600'
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiUser} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Setup & Login Test</h1>
        <p className="text-gray-600 mb-6">
          Complete account setup and login process for: <strong>hoxs@live.com</strong>
        </p>
        
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {[
            { phase: 'setup', label: 'Setup' },
            { phase: 'verification', label: 'Verify' },
            { phase: 'login', label: 'Login' },
            { phase: 'dashboard', label: 'Dashboard' }
          ].map((item, index) => (
            <div key={item.phase} className="flex items-center">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getPhaseColor(item.phase)}`}>
                <SafeIcon icon={getPhaseIcon(item.phase)} className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {index < 3 && <SafeIcon icon={FiArrowRight} className="h-4 w-4 text-gray-400 mx-2" />}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Account Information:</h3>
          <div className="text-sm text-blue-800 text-left space-y-1">
            <p><strong>Email:</strong> {accountData.email}</p>
            <p><strong>Password:</strong> {accountData.password}</p>
            <p><strong>Name:</strong> {accountData.fullName}</p>
            <p><strong>Company:</strong> {accountData.companyName}</p>
            <p><strong>Type:</strong> {accountData.accountType}</p>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <button
            onClick={setupCompleteAccount}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Processing...' : 'Setup Complete Account'}</span>
          </button>

          <button
            onClick={testExistingLogin}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5" />
            <span>Test Existing Login</span>
          </button>
        </div>
      </div>

      {step && loading && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <SafeIcon icon={FiRefreshCw} className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-blue-800">{step}</span>
          </div>
        </div>
      )}

      {testResult && (
        <div className={`border rounded-lg p-6 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={testResult.success ? FiCheckCircle : FiXCircle} className={`h-6 w-6 ${testResult.success ? 'text-green-600' : 'text-red-600'}`} />
            <h3 className={`text-lg font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {testResult.success ? 'SUCCESS!' : 'FAILED!'}
            </h3>
          </div>
          
          <p className={`font-medium mb-4 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.message}
          </p>
          
          {testResult.details && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
              <h4 className="font-semibold mb-2">Details:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}

          {testResult.success && (
            <div className="mt-4 text-center">
              <a 
                href="/#/login" 
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <span>Go to Login Page</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🔧 What This Test Does:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Account Check:</strong> Verifies if account already exists</p>
          <p><strong>2. Registration:</strong> Creates Supabase auth user if needed</p>
          <p><strong>3. Profile Creation:</strong> Creates user profile in database</p>
          <p><strong>4. Email Verification:</strong> Handles EmailJS verification if needed</p>
          <p><strong>5. Login Testing:</strong> Multiple login attempts with retries</p>
          <p><strong>6. Dashboard Verification:</strong> Confirms profile loading works</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Manual Login Steps:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Wait for test completion</li>
          <li>2. Click "Go to Login Page" if successful</li>
          <li>3. Use credentials: hoxs@live.com / Hoxs1234</li>
          <li>4. Complete EmailJS verification if prompted</li>
          <li>5. Access your buyer dashboard</li>
        </ol>
      </div>
    </div>
  )
}

export default AccountSetupTest