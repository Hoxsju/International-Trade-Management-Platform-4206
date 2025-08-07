import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService } from '../../services/authService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiMail, FiPhone, FiBuilding, FiMapPin, FiMessageSquare, FiFileText, FiAlertTriangle, FiCheckCircle, FiClock } = FiIcons

const RegisterForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  
  const accountType = watch('accountType')

  const onSubmit = async (data) => {
    console.log('📝 Registration form submitted for regravity.net')
    setLoading(true)
    setError('')
    
    try {
      console.log('📤 Submitting registration...')
      const result = await AuthService.registerUser(data)
      
      if (result.success) {
        console.log('✅ Registration successful, email verification required')
        setRegistrationSuccess(true)
        setRegisteredEmail(data.email)
      } else {
        throw new Error(result.message || 'Registration failed')
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-gray-600 mt-2">Join Regravity's international trade platform</p>
        <p className="text-sm text-primary-600 font-medium">regravity.net</p>
      </div>

      {registrationSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <SafeIcon icon={FiCheckCircle} className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-3">Registration Successful!</h3>
          <p className="text-green-700 mb-6">
            We've sent a confirmation email to <strong>{registeredEmail}</strong>.
            Please check your inbox and click the verification link to activate your account.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-green-600">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
            <Link 
              to="/login" 
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
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

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" /> Full Name *
                </label>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" /> Email *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiPhone} className="inline h-4 w-4 mr-1" /> Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiBuilding} className="inline h-4 w-4 mr-1" /> Company Name *
                </label>
                <input
                  type="text"
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your company name"
                />
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
              </div>
            </div>

            {/* Supplier-specific fields */}
            {accountType === 'supplier' && (
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chinese Company Name
                    </label>
                    <input
                      type="text"
                      {...register('chineseCompanyName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="公司中文名称 (可选)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SafeIcon icon={FiFileText} className="inline h-4 w-4 mr-1" /> Business License Number
                    </label>
                    <input
                      type="text"
                      {...register('businessLicense')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter business license number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMapPin} className="inline h-4 w-4 mr-1" /> Official Address
                  </label>
                  <textarea
                    {...register('officialAddress')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your company's official address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" /> WeChat ID (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('wechatId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your WeChat ID"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter a secure password (min 6 characters)"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <SafeIcon icon={FiClock} className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiCheckCircle} className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default RegisterForm