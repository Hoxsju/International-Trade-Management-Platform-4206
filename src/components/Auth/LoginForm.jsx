import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService } from '../../services/authService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock, FiAlertTriangle } = FiIcons

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [emailForConfirmation, setEmailForConfirmation] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Starting login for regravity.net...', data.email)
      
      // Sign out any existing session first
      await signOut()
      
      // Attempt login
      const result = await AuthService.loginUser(data.email, data.password)
      
      if (result.success && result.shouldRedirectToDashboard) {
        console.log('✅ Login successful, redirecting to dashboard')
        navigate('/dashboard')
      } else if (result.needsEmailConfirmation) {
        console.log('📧 Email confirmation required')
        setNeedsConfirmation(true)
        setEmailForConfirmation(data.email)
      } else {
        throw new Error(result.message || 'Login failed')
      }
    } catch (err) {
      console.error('💥 Login form error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!emailForConfirmation) return
    
    setLoading(true)
    try {
      const result = await AuthService.resendConfirmationEmail(emailForConfirmation)
      if (result.success) {
        setError('')
        alert('Confirmation email sent! Please check your inbox.')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to resend confirmation email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your Regravity account</p>
        <p className="text-sm text-primary-600 font-medium">regravity.net</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {needsConfirmation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-800 text-sm font-medium">Email not confirmed</p>
              <p className="text-yellow-700 text-sm mt-1">
                Please check your email for a confirmation link or click below to resend it.
              </p>
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="mt-2 text-yellow-800 underline text-sm hover:text-yellow-900 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend confirmation email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" /> Email
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" /> Password
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm