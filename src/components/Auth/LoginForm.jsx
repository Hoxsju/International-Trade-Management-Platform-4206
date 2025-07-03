import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService } from '../../services/authService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock } = FiIcons

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Starting simple login for:', data.email)
      
      // Sign out any existing session first
      await signOut()
      
      // Use simple login
      const result = await AuthService.simpleLogin(data.email, data.password)
      
      if (result.success && result.shouldRedirectToDashboard) {
        console.log('✅ Login successful, redirecting to dashboard')
        navigate('/dashboard')
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

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your Regravity account</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
            Email
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" />
            Password
          </label>
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

      {/* Test Account Info */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <h4 className="font-medium text-green-900 mb-2">✅ Test Account Available</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p><strong>Email:</strong> hoxs@regravity.net</p>
          <p><strong>Password:</strong> Hoxs1234</p>
          <p><strong>Type:</strong> Admin account (full access)</p>
        </div>
      </div>

      {/* Development Info */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-gray-700 text-sm font-medium mb-2">🔧 Simple Login System:</p>
          <ul className="text-gray-600 text-xs space-y-1">
            <li>• No email confirmation required</li>
            <li>• Direct login after registration</li>
            <li>• Automatic profile creation</li>
            <li>• Clean error handling</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default LoginForm