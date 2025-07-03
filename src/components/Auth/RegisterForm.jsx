import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../services/authService'
import { ProfileService } from '../../services/profileService'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiMail, FiPhone, FiBuilding, FiMapPin, FiMessageSquare, FiFileText, FiShield, FiAlertTriangle, FiCopy } = FiIcons

// Enhanced Manual Verification Modal
const ManualVerificationModal = ({ onClose, email, fullName, verificationCode }) => {
  const manualText = EmailService.createManualFallbackText('verification_code', {
    email: email,
    code: verificationCode
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualText)
    alert('Verification code text copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Manual Verification - Email Service Issue</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiShield} className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Email Service Temporarily Unavailable</span>
            </div>
            <p className="text-yellow-700 text-sm">
              The automated email verification system is currently experiencing issues.
              Please use the verification code below or send it manually.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
            <h4 className="font-bold text-green-900 text-xl mb-2">Your Verification Code</h4>
            <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
              <span className="text-4xl font-mono font-bold text-green-800 tracking-widest">
                {verificationCode}
              </span>
            </div>
            <p className="text-green-700 text-sm">
              Enter this code in the verification form to complete your registration
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Manual Verification Text</h4>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                <SafeIcon icon={FiCopy} className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
            <textarea
              value={manualText}
              readOnly
              rows={8}
              className="w-full p-3 border border-gray-300 rounded font-mono text-sm bg-white"
            />
            <p className="text-xs text-gray-600 mt-2">
              You can send this text to {email} manually if needed
            </p>
          </div>
        </div>

        <div className="flex justify-center p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiShield} className="h-4 w-4" />
            <span>Continue with Code: {verificationCode}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const RegisterForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFirstUser, setIsFirstUser] = useState(false)
  const [showManualVerification, setShowManualVerification] = useState(false)
  const [verificationData, setVerificationData] = useState(null)

  const accountType = watch('accountType')

  // Check if this is the first user on component mount
  React.useEffect(() => {
    checkFirstUser()
  }, [])

  const checkFirstUser = async () => {
    try {
      const firstUser = await ProfileService.isFirstUser()
      setIsFirstUser(firstUser)
    } catch (error) {
      console.error('Error checking first user:', error)
      setIsFirstUser(false)
    }
  }

  const onSubmit = async (data) => {
    console.log('📝 Enhanced registration form submitted with robust email delivery')
    setLoading(true)
    setError('')

    try {
      // Use enhanced simple registration with robust email notifications
      const result = await AuthService.simpleRegistration(data)

      if (result.success && result.shouldRedirectToDashboard) {
        console.log('✅ Enhanced registration and login successful')
        navigate('/dashboard')
      } else if (result.success && result.needsLogin) {
        console.log('✅ Enhanced registration successful, redirecting to login')
        navigate('/login')
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('❌ Enhanced registration error:', err)
      
      // Check if this is an email verification issue
      if (err.message.includes('verification') || err.message.includes('Email service')) {
        console.log('📧 Email service issue detected, showing manual verification option')
        
        // Generate a verification code for manual use
        const manualCode = EmailService.generateVerificationCode()
        
        setVerificationData({
          email: data.email,
          fullName: data.fullName,
          verificationCode: manualCode
        })
        
        setShowManualVerification(true)
        setError('Email verification service is temporarily unavailable. Please use the manual verification code provided.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-gray-600 mt-2">Join Regravity's international trade platform</p>

        {/* Show admin notice for first user */}
        {isFirstUser && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-center space-x-2">
              <SafeIcon icon={FiShield} className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                🎉 You're the first user! You'll automatically become an Admin.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="buyer"
                {...register('accountType', { required: 'Please select account type' })}
                className="mr-3"
                disabled={isFirstUser}
              />
              <div>
                <SafeIcon icon={FiUser} className="h-5 w-5 text-primary-600 mb-1" />
                <div className="font-medium">Buyer</div>
                <div className="text-sm text-gray-500">Purchase from suppliers</div>
              </div>
            </label>
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="supplier"
                {...register('accountType', { required: 'Please select account type' })}
                className="mr-3"
                disabled={isFirstUser}
              />
              <div>
                <SafeIcon icon={FiBuilding} className="h-5 w-5 text-primary-600 mb-1" />
                <div className="font-medium">Supplier</div>
                <div className="text-sm text-gray-500">Sell to overseas buyers</div>
              </div>
            </label>
          </div>
          {errors.accountType && <p className="text-red-500 text-sm mt-1">{errors.accountType.message}</p>}
        </div>

        {/* Hidden admin field for first user */}
        {isFirstUser && (
          <input type="hidden" {...register('accountType')} value="admin" />
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiPhone} className="inline h-4 w-4 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiBuilding} className="inline h-4 w-4 mr-1" />
              Company Name
            </label>
            <input
              type="text"
              {...register('companyName', { required: 'Company name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
          </div>
        </div>

        {/* Supplier-specific fields */}
        {accountType === 'supplier' && !isFirstUser && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chinese Company Name
                </label>
                <input
                  type="text"
                  {...register('chineseCompanyName', { 
                    required: accountType === 'supplier' ? 'Chinese company name is required' : false 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.chineseCompanyName && <p className="text-red-500 text-sm mt-1">{errors.chineseCompanyName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiFileText} className="inline h-4 w-4 mr-1" />
                  Business License Number
                </label>
                <input
                  type="text"
                  {...register('businessLicense', { 
                    required: accountType === 'supplier' ? 'Business license is required' : false 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.businessLicense && <p className="text-red-500 text-sm mt-1">{errors.businessLicense.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMapPin} className="inline h-4 w-4 mr-1" />
                Official Address
              </label>
              <textarea
                {...register('officialAddress', { 
                  required: accountType === 'supplier' ? 'Official address is required' : false 
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.officialAddress && <p className="text-red-500 text-sm mt-1">{errors.officialAddress.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
                WeChat ID (Optional)
              </label>
              <input
                type="text"
                {...register('wechatId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">📧 Enhanced Registration</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 📝 Account created instantly</li>
          <li>• 🔐 No email verification required</li>
          <li>• ⚡ Immediate access after registration</li>
          <li>• 🎯 Direct login to dashboard</li>
          <li>• 📧 Robust email delivery system</li>
          {isFirstUser && <li>• 🔑 First user gets admin privileges automatically!</li>}
        </ul>
      </div>

      {/* Manual Verification Modal */}
      {showManualVerification && verificationData && (
        <ManualVerificationModal
          onClose={() => {
            setShowManualVerification(false)
            // Redirect to login after showing manual verification
            navigate('/login')
          }}
          email={verificationData.email}
          fullName={verificationData.fullName}
          verificationCode={verificationData.verificationCode}
        />
      )}
    </div>
  )
}

export default RegisterForm