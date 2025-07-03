import React, { useState } from 'react'
import { AuthService } from '../../services/authService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw, FiArrowRight } = FiIcons

const CompleteAccountTest = () => {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')

  // Test credentials for hoxs@regravity.net
  const testCredentials = {
    email: 'hoxs@regravity.net',
    password: 'Hoxs1234',
    fullName: 'Hoxs Regravity User',
    companyName: 'Regravity Company',
    phone: '1234567890',
    accountType: 'buyer'
  }

  const runCompleteTest = async () => {
    setLoading(true)
    setTestResult(null)
    setStep('')

    try {
      // Step 1: Test Enhanced Login for hoxs@regravity.net
      setStep('Testing enhanced login flow with improved user lookup...')
      console.log('🧪 Testing enhanced login with multiple user lookup methods...')

      const loginResult = await AuthService.completeLogin(testCredentials.email, testCredentials.password)

      if (loginResult.success && loginResult.shouldRedirectToDashboard) {
        setTestResult({
          success: true,
          message: '🎉 Enhanced login successful! No verification needed!',
          details: {
            flow: 'Enhanced Login → Dashboard Ready',
            email: testCredentials.email,
            ...loginResult.data
          }
        })
        return
      } else if (loginResult.needsVerification) {
        console.log('📧 Enhanced verification required')
        console.log('🔍 Verification details:', {
          code: loginResult.verificationCode,
          userId: loginResult.userId,
          method: loginResult.method
        })
        
        // Simulate enhanced EmailJS verification
        setStep('Simulating enhanced EmailJS verification with improved retry logic...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        const verificationResult = await AuthService.verifyCodeAndLogin(
          testCredentials.email,
          testCredentials.password,
          loginResult.verificationCode, // Use exact same code
          loginResult.verificationCode, // Use exact same code
          loginResult.userId
        )

        if (verificationResult.success) {
          setTestResult({
            success: true,
            message: '🎉 Enhanced login successful after EmailJS verification with improved retry logic!',
            details: {
              flow: 'Enhanced Login → EmailJS Verification → Progressive Retry → Dashboard Ready',
              email: testCredentials.email,
              verificationCode: loginResult.verificationCode,
              method: loginResult.method,
              attempts: verificationResult.attempts,
              codeType: typeof loginResult.verificationCode,
              ...verificationResult.data
            }
          })
          return
        } else {
          throw new Error(`Enhanced verification failed: ${verificationResult.message}`)
        }
      } else {
        // Try registration if login fails
        setStep('Login failed, testing enhanced registration flow...')
        
        const registrationResult = await AuthService.completeRegistration(testCredentials)

        if (registrationResult.success && registrationResult.needsVerification) {
          console.log('📧 Registration successful, EmailJS verification required')
          
          // Simulate EmailJS verification for registration
          setStep('Simulating enhanced EmailJS verification for registration...')
          await new Promise(resolve => setTimeout(resolve, 2000))

          const regVerificationResult = await AuthService.completeRegistrationVerification(
            testCredentials.email,
            testCredentials.password,
            registrationResult.verificationCode,
            registrationResult.verificationCode,
            registrationResult.userId
          )

          if (regVerificationResult.success && regVerificationResult.shouldRedirectToDashboard) {
            setTestResult({
              success: true,
              message: '🎉 Enhanced registration flow successful! Account created with improved verification!',
              details: {
                flow: 'Enhanced Registration → EmailJS Verification → Dashboard Ready',
                email: testCredentials.email,
                verificationCode: registrationResult.verificationCode,
                codeType: typeof registrationResult.verificationCode,
                ...regVerificationResult.data
              }
            })
            return
          } else {
            throw new Error(`Registration verification failed: ${regVerificationResult.message}`)
          }
        } else {
          throw new Error(registrationResult.message || loginResult.message)
        }
      }

    } catch (error) {
      console.error('❌ Enhanced complete test failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { 
          error: error.message,
          email: testCredentials.email
        }
      })
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const testEnhancedLoginOnly = async () => {
    setLoading(true)
    setTestResult(null)
    setStep('Testing enhanced login with improved user lookup for hoxs@regravity.net...')

    try {
      const result = await AuthService.completeLogin(testCredentials.email, testCredentials.password)

      if (result.success && result.shouldRedirectToDashboard) {
        setTestResult({
          success: true,
          message: '🎉 Enhanced login successful without verification!',
          details: {
            email: testCredentials.email,
            ...result.data
          }
        })
      } else if (result.needsVerification) {
        setStep('Simulating enhanced EmailJS verification with progressive retry...')
        console.log('🔍 Enhanced login verification details:', {
          code: result.verificationCode,
          userId: result.userId,
          method: result.method
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        const verificationResult = await AuthService.verifyCodeAndLogin(
          testCredentials.email,
          testCredentials.password,
          result.verificationCode, // Use exact same code
          result.verificationCode, // Use exact same code
          result.userId
        )

        if (verificationResult.success) {
          setTestResult({
            success: true,
            message: '🎉 Enhanced login successful after EmailJS verification with progressive retry!',
            details: {
              email: testCredentials.email,
              verificationCode: result.verificationCode,
              method: result.method,
              attempts: verificationResult.attempts,
              codeType: typeof result.verificationCode,
              ...verificationResult.data
            }
          })
        } else {
          throw new Error(verificationResult.message)
        }
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      console.error('❌ Enhanced login test failed:', error)
      setTestResult({
        success: false,
        message: error.message,
        details: { 
          error: error.message,
          email: testCredentials.email
        }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Login System Test</h1>
        <p className="text-gray-600 mb-6">
          Test the enhanced login system with improved user lookup for: <strong>hoxs@regravity.net</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Enhanced System Features:</h3>
          <div className="text-sm text-blue-800 text-left space-y-1">
            <p>✅ <strong>Multiple User Lookup Methods:</strong> Admin API, profile table, direct auth queries</p>
            <p>✅ <strong>Enhanced Error Handling:</strong> Better fallback mechanisms</p>
            <p>✅ <strong>Progressive Retry Logic:</strong> Login attempts with increasing delays</p>
            <p>✅ <strong>Improved Email Confirmation:</strong> Multiple confirmation methods</p>
            <p>✅ <strong>Better Debugging:</strong> Detailed logging and error information</p>
            <p>✅ <strong>Robust Verification:</strong> Enhanced EmailJS integration</p>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <button
            onClick={runCompleteTest}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing...' : 'Run Enhanced Test'}</span>
          </button>

          <button
            onClick={testEnhancedLoginOnly}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5" />
            <span>Test Enhanced Login</span>
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
              <h4 className="font-semibold mb-2">Enhanced Test Details:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}

          {testResult.success && (
            <div className="mt-4 text-center">
              <a 
                href="/#/login" 
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mr-4"
              >
                <span>Go to Enhanced Login</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </a>
              <a 
                href="/#/dashboard" 
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <span>Go to Dashboard</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🔧 Enhanced Login System:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Multiple User Lookup:</strong> Tries admin API, profile table, and direct auth queries</p>
          <p><strong>2. Enhanced Error Handling:</strong> Better fallback mechanisms and error messages</p>
          <p><strong>3. Progressive Retry Logic:</strong> Login attempts with 1s, 3s, 5s, 8s delays</p>
          <p><strong>4. Improved Email Confirmation:</strong> Multiple methods to confirm user email</p>
          <p><strong>5. Better Debugging:</strong> Detailed logging shows which method worked</p>
          <p><strong>6. Enhanced Verification:</strong> Robust EmailJS code verification</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">How to Test:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Run the enhanced test to verify the improved login system</li>
          <li>2. If successful, go to the login page</li>
          <li>3. Login with: hoxs@regravity.net / Hoxs1234</li>
          <li>4. If verification is needed, check email or use debug auto-fill</li>
          <li>5. The system will try multiple methods to make login work</li>
        </ol>
      </div>
    </div>
  )
}

export default CompleteAccountTest