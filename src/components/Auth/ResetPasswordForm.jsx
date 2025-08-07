import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock, FiCheckCircle, FiAlertCircle, FiArrowLeft } = FiIcons;

const ResetPasswordForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  
  // Enhanced token extraction with multiple methods and detailed debugging
  useEffect(() => {
    console.log('🔑 Starting password reset token extraction...');
    console.log('📍 Current URL:', window.location.href);
    
    // Method 1: Extract from hash fragment with multiple patterns
    let hashToken = null;
    const hashPart = window.location.hash || '';
    console.log('🔍 Hash part:', hashPart);
    
    // Try different hash patterns
    const hashPatterns = [
      /#\/reset-password\?token=([^&]+)/,  // /#/reset-password?token=abc
      /#\/reset-password\/\?token=([^&]+)/,  // /#/reset-password/?token=abc
      /#\/reset-password\/([^?&]+)/,  // /#/reset-password/abc
      /#\/reset-password.*token=([^&]+)/,  // Any pattern with token= in hash
    ];
    
    for (const pattern of hashPatterns) {
      const match = hashPart.match(pattern);
      if (match && match[1]) {
        hashToken = match[1];
        console.log('✅ Found token in hash with pattern:', pattern, hashToken);
        break;
      }
    }
    
    // Method 2: Extract from search params (query string)
    const searchToken = searchParams.get('token');
    console.log('🔍 Search params token:', searchToken);
    
    // Method 3: Extract from location state
    const stateToken = location?.state?.token;
    console.log('🔍 Location state token:', stateToken);
    
    // Method 4: Look for access_token in hash or search (Supabase often uses this)
    const accessTokenMatch = window.location.href.match(/access_token=([^&]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    console.log('🔍 Access token:', accessToken);
    
    // Method 5: Look for type=recovery in the URL (Supabase password reset flow)
    const isRecoveryFlow = window.location.href.includes('type=recovery');
    console.log('🔍 Is recovery flow:', isRecoveryFlow);
    
    // Use the first valid token found
    const extractedToken = hashToken || searchToken || stateToken || accessToken || '';
    
    console.log('🔑 Final extracted token:', extractedToken ? `${extractedToken.substring(0, 5)}...` : 'Not found');
    setToken(extractedToken);
    
    // If we have a token, check its validity with Supabase
    if (extractedToken) {
      console.log('✅ Token found, attempting validation...');
      
      // Try to get session info
      const checkToken = async () => {
        try {
          // This will work if the token is already in the URL and Supabase has processed it
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session) {
            console.log('✅ Valid session found with token');
          } else {
            console.log('⚠️ No active session yet, but token is present');
          }
        } catch (err) {
          console.warn('⚠️ Token validation warning:', err.message);
        }
      };
      
      checkToken();
    } else {
      console.warn('⚠️ No reset token found in URL');
      
      // Fallback: Check if user is already authenticated (might be a direct access)
      const checkAuth = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          console.log('✅ User is already authenticated, may proceed with reset');
          setToken('authenticated'); // Special case - user is already logged in
        }
      };
      
      checkAuth();
    }
  }, [location, searchParams]);

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Resetting password...');
      
      // Use Supabase's built-in password reset functionality
      const { error: resetError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (resetError) {
        console.error('❌ Password reset error:', resetError);
        throw new Error(`Failed to reset password: ${resetError.message}`);
      }

      console.log('✅ Password reset successful');
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('💥 Password reset failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your new password below
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <SafeIcon icon={FiCheckCircle} className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Password Reset Successful!</h3>
          <p className="text-green-700 mb-4">
            Your password has been updated successfully. You will be redirected to the login page in a moment.
          </p>
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

          {!token && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-600 text-sm">
                  No reset token found. This link may be invalid or expired. 
                  Please try requesting a new password reset.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" /> New Password
              </label>
              <input
                type="password"
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your new password"
              />
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" /> Confirm Password
              </label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === watch('newPassword') || "Passwords don't match"
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/#/login" 
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
            >
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-1" />
              <span>Back to Login</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default ResetPasswordForm;