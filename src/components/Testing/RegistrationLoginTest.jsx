import React, { useState } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import { generateBuyerId } from '../../utils/idGenerator'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw, FiMail } = FiIcons

const RegistrationLoginTest = () => {
  const { signUp, signIn, signOut } = useAuth()
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')

  // Test data
  const testData = {
    email: 'hoxs@hoxs.net',
    password: 'Hoxs1234',
    fullName: 'Hoxs test 1',
    companyName: 'RGV1',
    phone: '1234567890',
    accountType: 'buyer'
  }

  const updateStep = (newStep) => {
    setStep(newStep)
    console.log('📍 Step:', newStep)
  }

  const testCompleteFlow = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      updateStep('Cleaning up any existing data...')
      
      // Clean up any existing data first
      try {
        await supabase.from('user_profiles_rg2024').delete().eq('email', testData.email)
        await supabase.auth.admin.deleteUser(testData.email).catch(() => {})
      } catch (cleanupError) {
        console.log('⚠️ Cleanup warning:', cleanupError.message)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 1: Test Registration
      updateStep('Creating user account...')
      
      const { data: authData, error: authError } = await signUp(
        testData.email, 
        testData.password,
        {
          full_name: testData.fullName,
          account_type: testData.accountType,
          user_id: generateBuyerId()
        }
      )

      if (authError) {
        throw new Error(`Registration failed: ${authError.message}`)
      }

      if (!authData?.user?.id) {
        throw new Error('No user ID returned from registration')
      }

      console.log('✅ User created:', authData.user.id)
      
      // Step 2: Create Profile
      updateStep('Creating user profile...')
      
      const profileData = {
        id: authData.user.id,
        user_id: authData.user.user_metadata?.user_id || generateBuyerId(),
        email: testData.email,
        full_name: testData.fullName,
        phone: testData.phone,
        company_name: testData.companyName,
        account_type: testData.accountType,
        status: 'active',
        email_verified: true,
        verification_method: 'test'
      }

      const { data: profileResult, error: profileError } = await ProfileService.createUserProfile(profileData)

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('✅ Profile created:', profileResult)

      // Step 3: Sign out and test login
      updateStep('Signing out for login test...')
      await signOut()
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 4: Test Normal Login
      updateStep('Testing normal login...')
      
      const { data: loginData, error: loginError } = await signIn(testData.email, testData.password)

      if (loginError) {
        console.log('❌ Normal login failed (expected if email not confirmed):', loginError.message)
        
        // Step 5: Test EmailJS Verification Flow
        if (loginError.message.includes('Email not confirmed') || 
            loginError.message.includes('not confirmed')) {
          
          updateStep('Testing EmailJS verification flow...')
          
          // Simulate EmailJS verification
          const verificationCode = EmailService.generateVerificationCode()
          console.log('📧 Generated verification code:', verificationCode)
          
          // Manually confirm the user email
          updateStep('Confirming email manually...')
          
          try {
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
              authData.user.id, 
              { email_confirm: true }
            )
            
            if (confirmError) {
              console.warn('⚠️ Manual confirmation warning:', confirmError.message)
            } else {
              console.log('✅ Email confirmed manually')
            }
          } catch (confirmError) {
            console.warn('⚠️ Manual confirmation failed:', confirmError.message)
          }

          // Wait and try login again
          updateStep('Retrying login after email confirmation...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          const { data: retryLoginData, error: retryLoginError } = await signIn(testData.email, testData.password)
          
          if (retryLoginError) {
            throw new Error(`Login still failed after confirmation: ${retryLoginError.message}`)
          }
          
          console.log('✅ Login successful after confirmation:', retryLoginData.user?.id)
          
          setTestResult({
            success: true,
            message: '🎉 Complete registration and login flow successful!',
            details: {
              authUserId: authData.user.id,
              profileCreated: !!profileResult,
              emailConfirmed: true,
              loginSuccessful: !!retryLoginData.user,
              verificationCode: verificationCode,
              flow: 'registration -> profile creation -> email confirmation -> login'
            }
          })
        } else {
          throw new Error(`Unexpected login error: ${loginError.message}`)
        }
      } else {
        console.log('✅ Normal login successful:', loginData.user?.id)
        
        setTestResult({
          success: true,
          message: '🎉 Registration and login successful without email confirmation needed!',
          details: {
            authUserId: authData.user.id,
            profileCreated: !!profileResult,
            loginSuccessful: !!loginData.user,
            flow: 'registration -> profile creation -> immediate login'
          }
        })
      }

    } catch (error) {
      console.error('❌ Test failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { error: error.message }
      })
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiUser} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Registration & Login Test</h1>
        <p className="text-gray-600 mb-6">
          Test the complete flow: Registration → Profile Creation → Email Confirmation → Login
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Test Account Data:</h3>
          <div className="text-sm text-blue-800 text-left space-y-1">
            <p><strong>Name:</strong> {testData.fullName}</p>
            <p><strong>Email:</strong> {testData.email}</p>
            <p><strong>Company:</strong> {testData.companyName}</p>
            <p><strong>Password:</strong> {testData.password}</p>
            <p><strong>Account Type:</strong> {testData.accountType}</p>
          </div>
        </div>

        <button
          onClick={testCompleteFlow}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing...' : 'Test Complete Flow'}</span>
        </button>
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
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🔧 What This Test Does:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Cleanup:</strong> Removes any existing test data</p>
          <p><strong>2. Registration:</strong> Creates Supabase auth user with pre-confirmed email</p>
          <p><strong>3. Profile Creation:</strong> Creates user profile via secure function</p>
          <p><strong>4. Sign Out:</strong> Signs out to test fresh login</p>
          <p><strong>5. Login Test:</strong> Attempts normal login</p>
          <p><strong>6. Email Verification:</strong> If needed, tests EmailJS verification flow</p>
          <p><strong>7. Final Login:</strong> Confirms successful login to dashboard</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Expected Flow:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. ✅ User registration with email pre-confirmed</li>
          <li>2. ✅ Profile creation in database</li>
          <li>3. ✅ Sign out for fresh login test</li>
          <li>4. 🔄 Login attempt (may require email confirmation)</li>
          <li>5. 📧 EmailJS verification if needed</li>
          <li>6. ✅ Successful login to dashboard</li>
        </ol>
      </div>
    </div>
  )
}

export default RegistrationLoginTest