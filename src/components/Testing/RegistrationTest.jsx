import React, { useState } from 'react'
import { AuthService } from '../../services/authService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw, FiArrowRight } = FiIcons

const RegistrationTest = () => {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testData = {
    email: 'test-reg-' + Date.now() + '@regravity-test.com',
    password: 'test123456',
    fullName: 'Registration Test User',
    companyName: 'Test Registration Company',
    phone: '1234567890',
    accountType: 'buyer'
  }

  const testRegistrationFlow = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 Testing complete registration flow...')
      
      // Test the complete registration flow
      const result = await AuthService.completeRegistration(testData)

      if (result.success && result.needsVerification) {
        console.log('✅ Registration successful, verification required')
        
        // Simulate EmailJS verification
        await new Promise(resolve => setTimeout(resolve, 2000))

        const verificationResult = await AuthService.completeRegistrationVerification(
          testData.email,
          testData.password,
          result.verificationCode, // Use same code
          result.verificationCode, // Use same code
          result.userId
        )

        if (verificationResult.success && verificationResult.shouldRedirectToDashboard) {
          setTestResult({
            success: true,
            message: '🎉 Complete registration flow successful!',
            details: {
              flow: 'Registration → Profile Creation → EmailJS Verification → Login → Dashboard Ready',
              email: testData.email,
              userId: result.userId,
              verificationCode: result.verificationCode,
              isAdmin: result.data?.isAdmin || false,
              profileCreated: result.data?.profileCreated || false
            }
          })
        } else {
          throw new Error(`Verification completion failed: ${verificationResult.message}`)
        }
      } else if (result.success) {
        setTestResult({
          success: true,
          message: '🎉 Registration completed without verification!',
          details: {
            flow: 'Registration → Profile Creation → Dashboard Ready',
            email: testData.email,
            ...result.data
          }
        })
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      console.error('❌ Registration test failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { 
          error: error.message,
          email: testData.email
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiUser} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Flow Test</h1>
        <p className="text-gray-600 mb-6">
          Test the complete registration process with enhanced direct profile creation
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Test Account Data:</h3>
          <div className="text-sm text-blue-800 text-left space-y-1">
            <p><strong>Name:</strong> {testData.fullName}</p>
            <p><strong>Email:</strong> {testData.email}</p>
            <p><strong>Company:</strong> {testData.companyName}</p>
            <p><strong>Account Type:</strong> {testData.accountType}</p>
            <p><strong>Features:</strong> Direct profile creation, Enhanced verification, Progressive login retry</p>
          </div>
        </div>

        <button
          onClick={testRegistrationFlow}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing Registration...' : 'Test Registration Flow'}</span>
        </button>
      </div>

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

          {testResult.success && (
            <div className="mt-4 text-center">
              <a 
                href="/#/register" 
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mr-4"
              >
                <span>Try Manual Registration</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🔧 Enhanced Registration Features:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Direct Profile Creation:</strong> Bypasses database functions for reliability</p>
          <p><strong>2. First User Admin Check:</strong> Automatically makes first user an admin</p>
          <p><strong>3. Enhanced Error Handling:</strong> Better error messages and recovery</p>
          <p><strong>4. EmailJS Integration:</strong> Robust email verification system</p>
          <p><strong>5. Progressive Login Retry:</strong> Multiple login attempts after verification</p>
          <p><strong>6. Complete Flow Testing:</strong> Tests entire registration → verification → login process</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Expected Flow:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. ✅ Create auth user in Supabase</li>
          <li>2. ✅ Create profile directly in database (with admin check)</li>
          <li>3. ✅ Send EmailJS verification code</li>
          <li>4. ✅ Verify code and confirm email</li>
          <li>5. ✅ Progressive login retry until successful</li>
          <li>6. ✅ Redirect to dashboard</li>
        </ol>
      </div>
    </div>
  )
}

export default RegistrationTest