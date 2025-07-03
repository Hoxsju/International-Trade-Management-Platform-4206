import React, { useState, useEffect } from 'react'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield, FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } = FiIcons

const VerificationForm = ({ email, fullName, onVerify, onCodeEntered, expectedCode, purpose = 'signup' }) => {
  const [code, setCode] = useState('')
  const [sentCode, setSentCode] = useState(expectedCode || '')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [success, setSuccess] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

  useEffect(() => {
    if (expectedCode) {
      console.log('📧 Setting expected code from props:', expectedCode)
      setSentCode(expectedCode)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      sendVerificationCode()
    }
  }, [expectedCode])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const sendVerificationCode = async () => {
    setSending(true)
    setError('')

    try {
      console.log('📧 Sending EmailJS verification code to:', email)
      const response = await EmailService.sendVerificationCode(email, fullName, purpose)
      console.log('✅ EmailJS verification code sent:', response.code)
      
      setSentCode(response.code)
      setTimeLeft(600) // Reset timer
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('❌ Failed to send EmailJS verification code:', err)
      setError('Failed to send verification code. Please try again or contact us directly.')
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    console.log('🔐 === ENHANCED EmailJS VERIFICATION ATTEMPT ===')
    console.log('📝 Entered Code:', code)
    console.log('📧 Expected EmailJS Code:', sentCode)
    console.log('📊 Code Details:', {
      enteredLength: code.length,
      expectedLength: sentCode.length,
      enteredType: typeof code,
      expectedType: typeof sentCode,
      codesMatch: String(code).trim() === String(sentCode).trim()
    })

    if (loading || verificationComplete) {
      console.log('⏳ Already processing or completed, skipping...')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Enhanced validation checks
      if (!code || code.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code')
      }

      if (!sentCode) {
        throw new Error('No verification code was sent. Please try resending the code.')
      }

      // Clean codes for comparison
      const cleanEnteredCode = String(code).trim()
      const cleanExpectedCode = String(sentCode).trim()

      console.log('🔍 Code comparison:', {
        cleanEntered: cleanEnteredCode,
        cleanExpected: cleanExpectedCode,
        match: cleanEnteredCode === cleanExpectedCode
      })

      // Check if codes match with enhanced comparison
      if (cleanEnteredCode === cleanExpectedCode) {
        console.log('✅ Enhanced EmailJS Verification successful!')
        setSuccess(true)
        setVerificationComplete(true)

        // Call onCodeEntered if provided
        if (onCodeEntered) {
          console.log('📞 Calling onCodeEntered with code:', cleanEnteredCode)
          onCodeEntered(cleanEnteredCode)
        }

        // Wait a moment for UI update
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Call the onVerify callback
        console.log('🚀 Calling onVerify(true) - Enhanced EmailJS verification complete')
        onVerify(true)

      } else {
        console.log('❌ Enhanced EmailJS Verification failed - codes do not match')
        console.log('🔍 Mismatch details:', {
          entered: cleanEnteredCode,
          expected: cleanExpectedCode,
          enteredChars: cleanEnteredCode.split(''),
          expectedChars: cleanExpectedCode.split('')
        })
        setError(`Invalid verification code. Please check your email and try again.\n\nEntered: "${cleanEnteredCode}"\nExpected: "${cleanExpectedCode}"`)
      }

    } catch (err) {
      console.error('💥 Enhanced EmailJS Verification error:', err)
      setError(err.message)
      
      // Only call onVerify(false) for system errors, not user errors
      if (err.message.includes('No verification code')) {
        console.log('🚫 System error, calling onVerify(false)')
        onVerify(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('📋 Enhanced form submitted - triggering EmailJS verification')
    handleVerify()
  }

  const handleButtonClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🖱️ Enhanced button clicked - triggering EmailJS verification')
    handleVerify()
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError('') // Clear error when user types
    console.log('⌨️ Enhanced EmailJS Code entered:', value)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPurposeText = () => {
    switch (purpose) {
      case 'signup': return 'complete your registration'
      case 'login': return 'complete your login'
      default: return 'verify your identity'
    }
  }

  const isDebugMode = window.location.hostname === 'localhost'

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiShield} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Enter the code to {getPurposeText()}
        </p>
      </div>

      {/* Enhanced Debug Info */}
      {isDebugMode && sentCode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>🔧 Enhanced Debug Mode - EmailJS Code:</strong> {sentCode}
          </p>
          <p className="text-yellow-700 text-xs mt-1">
            Auto-fill this code in the input below to test
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>Code type: {typeof sentCode}</p>
            <p>Code length: {String(sentCode).length}</p>
            <p>Code chars: [{String(sentCode).split('').join(', ')}]</p>
          </div>
        </div>
      )}

      {success && !verificationComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-600 text-sm">
              Verification code sent successfully! Check your email.
            </p>
          </div>
        </div>
      )}

      {verificationComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-600 text-sm font-medium">
              ✅ Email verified successfully! {purpose === 'signup' ? 'Creating your account...' : 'Logging you in...'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-600 mr-2" />
            <div className="text-red-600 text-sm">
              <p className="font-medium">Verification Error:</p>
              <pre className="mt-1 text-xs whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">📧 Check Your Email</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Look for an email with subject "Your verification code"</li>
          <li>• The email contains a 6-digit number</li>
          <li>• Check your spam folder if you don't see it</li>
          <li>• The code expires in 10 minutes</li>
          <li>• Copy the code exactly as shown</li>
        </ul>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 tracking-widest"
            placeholder="000000"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            disabled={verificationComplete}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Enter the 6-digit code from your email
          </p>
          {isDebugMode && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              Debug: Entered "{code}" vs Expected "{sentCode}"
            </p>
          )}
        </div>

        {/* Enhanced Verify Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading || code.length !== 6 || !sentCode || verificationComplete}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiCheckCircle} className="h-4 w-4" />
          <span>
            {verificationComplete ? 'Verified!' : loading ? 'Verifying...' : 'Verify Email'}
          </span>
        </button>

        {/* Hidden submit button for Enter key */}
        <button type="submit" className="hidden">Submit</button>

        {/* Enhanced Debug Buttons */}
        {isDebugMode && !verificationComplete && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">🔧 Enhanced Debug Controls (Development Only)</p>
            <button
              type="button"
              onClick={() => {
                console.log('🔧 Enhanced Auto-filling EmailJS code:', sentCode)
                setCode(sentCode)
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700"
            >
              🔧 Auto-fill Code ({sentCode})
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🔧 Enhanced Force EmailJS verification success')
                setSuccess(true)
                setVerificationComplete(true)
                setTimeout(() => onVerify(true), 500)
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700"
            >
              🔧 Force Success
            </button>
          </div>
        )}
      </form>

      {!verificationComplete && (
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
            <SafeIcon icon={FiMail} className="h-4 w-4" />
            <span>Code expires in {formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={sending || timeLeft > 540} // Allow resend after 1 minute
            className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50 flex items-center space-x-1 mx-auto"
          >
            <SafeIcon icon={FiRefreshCw} className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
            <span>
              {sending ? 'Sending...' : timeLeft > 540 ? `Resend in ${formatTime(timeLeft - 540)}` : 'Resend Code'}
            </span>
          </button>
        </div>
      )}

      {/* Enhanced Debug panel */}
      {isDebugMode && (
        <div className="mt-6 p-4 bg-gray-100 border rounded-md">
          <h4 className="font-semibold text-gray-800 mb-2">🔧 Enhanced Debug Information:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Purpose:</strong> {purpose}</p>
            <p><strong>Entered Code:</strong> "{code}" (Length: {code.length}, Type: {typeof code})</p>
            <p><strong>Expected EmailJS Code:</strong> "{sentCode}" (Length: {String(sentCode).length}, Type: {typeof sentCode})</p>
            <p><strong>Codes Match:</strong> {String(code).trim() === String(sentCode).trim() ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Loading State:</strong> {loading ? '⏳ Processing' : '✅ Ready'}</p>
            <p><strong>Verification Complete:</strong> {verificationComplete ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Button Enabled:</strong> {(!loading && code.length === 6 && sentCode && !verificationComplete) ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificationForm