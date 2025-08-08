import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiCopy, FiExternalLink } = FiIcons;

const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [manualResetUrl, setManualResetUrl] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      // Use enhanced password reset with multiple fallbacks
      const result = await AuthService.resetPassword(data.email);
      
      if (result.success) {
        setSuccess(true);
        
        // If we got a manual reset URL, store it for display
        if (result.method === 'manual' && result.resetUrl) {
          setManualResetUrl(result.resetUrl);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (navigator.clipboard && manualResetUrl) {
      navigator.clipboard.writeText(manualResetUrl)
        .then(() => {
          alert('Reset link copied to clipboard!');
        })
        .catch(() => {
          alert('Failed to copy. Please select and copy the link manually.');
        });
    }
  };
  
  const openResetLink = () => {
    if (manualResetUrl) {
      window.open(manualResetUrl, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you instructions to reset your password
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <SafeIcon icon={FiCheckCircle} className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Check Your Email</h3>
          <p className="text-green-700 mb-4">
            If an account exists with the email you provided, we've sent password reset instructions.
          </p>
          <p className="text-green-700 mb-4">
            Click the link in the email, and you'll be directed to a page where you can create a new password.
          </p>
          
          {manualResetUrl && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-5 w-5 mr-2" />
                Email System Notice
              </h4>
              <p className="text-yellow-700 text-sm mb-3">
                If you don't receive the email, you can use this direct reset link:
              </p>
              <div className="bg-white p-2 rounded border border-yellow-200 mb-3 overflow-hidden">
                <p className="text-xs text-yellow-800 truncate font-mono">{manualResetUrl}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  <SafeIcon icon={FiCopy} className="h-4 w-4" />
                  <span>Copy Link</span>
                </button>
                <button 
                  onClick={openResetLink}
                  className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
                  <span>Open Link</span>
                </button>
              </div>
            </div>
          )}
          
          <Link to="/login" className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 mt-4">
            Return to Login
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
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
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center">
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-1" />
              <span>Back to Login</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;