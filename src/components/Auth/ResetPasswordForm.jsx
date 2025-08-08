import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiInfo, FiClock, FiKey } = FiIcons;

const ResetPasswordForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize token and email state
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [hasCheckedParams, setHasCheckedParams] = useState(false);
  const [processingStage, setProcessingStage] = useState('checking'); // checking, ready, error

  // Extract token and email from URL query parameters and hash
  useEffect(() => {
    console.log('🔍 Checking for reset parameters in URL...');
    
    // Function to extract parameters from various URL formats
    const extractResetParams = () => {
      // Check URL search parameters
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = searchParams.get('token');
      const queryEmail = searchParams.get('email');
      
      // Check URL hash parameters
      const hashParams = {};
      const hash = window.location.hash.split('?')[1] || '';
      new URLSearchParams(hash).forEach((value, key) => {
        hashParams[key] = value;
      });
      
      // Check for access_token in hash fragment or search params
      const url = window.location.href;
      const accessTokenMatch = url.match(/access_token=([^&]+)/);
      const accessToken = accessTokenMatch && accessTokenMatch[1];
      
      // Check for type=recovery in URL
      const isRecoveryFlow = url.includes('type=recovery');
      
      // Check for token in hash fragment (various formats)
      const hashPart = window.location.hash || '';
      let hashToken = null;
      const hashPatterns = [
        /#\/reset-password\?token=([^&]+)/,
        /#\/reset-password\/\?token=([^&]+)/,
        /#\/reset-password\/([^?&]+)/,
        /#token=([^&]+)/
      ];
      
      for (const pattern of hashPatterns) {
        const match = hashPart.match(pattern);
        if (match && match[1]) {
          hashToken = match[1];
          break;
        }
      }
      
      // Determine which token to use
      const extractedToken = queryToken || hashParams.token || accessToken || hashToken;
      const extractedEmail = queryEmail || hashParams.email;
      
      // Debug logging
      if (extractedToken) {
        console.log('🔑 Found reset token:', extractedToken.substring(0, 5) + '...');
      } else {
        console.warn('⚠️ No reset token found in URL');
      }
      
      if (extractedEmail) {
        console.log('📧 Found email:', extractedEmail);
      }
      
      // Check for recovery flow
      if (isRecoveryFlow) {
        console.log('✅ Found recovery flow in URL');
        return { token: 'recovery_flow', email: extractedEmail, isRecoveryFlow: true };
      }
      
      return { token: extractedToken, email: extractedEmail, isRecoveryFlow: false };
    };

    // Get parameters from URL
    const { token: extractedToken, email: extractedEmail, isRecoveryFlow } = extractResetParams();
    
    if (extractedToken) {
      setToken(extractedToken);
      setProcessingStage('ready');
      
      // If we have a recovery flow token, try to get session
      if (isRecoveryFlow || extractedToken === 'recovery_flow') {
        console.log('🔄 Checking for recovery session...');
        setStatusMessage('Verifying your reset session...');
        
        const checkSession = async () => {
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              console.log('✅ Valid recovery session found');
              setToken('valid_session');
              setProcessingStage('ready');
              setStatusMessage('Reset session verified. You can now create a new password.');
            } else {
              console.log('❌ No recovery session found');
              setProcessingStage('error');
              setStatusMessage('No active reset session found. The reset link may have expired.');
              setError('No active reset session found. Please request a new password reset link.');
            }
          } catch (sessionError) {
            console.error('Failed to check session:', sessionError);
            setProcessingStage('error');
            setStatusMessage('Error verifying reset session.');
            setError('Failed to verify reset session. Please request a new password reset link.');
          }
        };
        
        checkSession();
      }
    } else {
      console.warn('⚠️ No reset token found in URL');
      setProcessingStage('error');
      setStatusMessage('No reset token found. Please request a new password reset.');
      setError('No reset token found. The link may be invalid or expired.');
    }
    
    if (extractedEmail) {
      setEmail(extractedEmail);
    }
    
    setHasCheckedParams(true);
  }, [location]);

  // Once we've checked the parameters, check for an active session if needed
  useEffect(() => {
    if (hasCheckedParams && !token) {
      console.log('🔍 No token found in URL, checking for active session...');
      setStatusMessage('Checking for active session...');
      
      const checkActiveSession = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            console.log('✅ Active session found, allowing password reset');
            setToken('active_session');
            setProcessingStage('ready');
            setStatusMessage('Active session found. You can reset your password.');
          } else {
            console.log('❌ No active session found');
            setProcessingStage('error');
            setStatusMessage('No active session found. Please request a new password reset.');
            setError('No reset token found. This link may be invalid or expired. Please request a new password reset.');
          }
        } catch (sessionError) {
          console.error('Failed to check session:', sessionError);
          setProcessingStage('error');
          setStatusMessage('Error checking session status.');
          setError('Failed to verify your session. Please request a new password reset.');
        }
      };
      
      checkActiveSession();
    }
  }, [hasCheckedParams, token]);

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('Resetting your password...');
    
    try {
      console.log('🔐 Resetting password...');
      
      // Use enhanced password update method with token and email
      const result = await AuthService.updatePassword(data.newPassword, token, email);

      if (result.success) {
        console.log('✅ Password reset successful:', result);
        setSuccess(true);
        setStatusMessage('Your password has been updated successfully!');
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('💥 Password reset failed:', err);
      setError(err.message);
      setStatusMessage('Failed to reset your password.');
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
        
        {statusMessage && processingStage !== 'error' && (
          <div className="mt-2 text-sm bg-blue-50 text-blue-700 p-2 rounded-md border border-blue-200 flex items-center justify-center">
            <SafeIcon icon={processingStage === 'checking' ? FiClock : FiInfo} className="h-4 w-4 mr-2" />
            {statusMessage}
          </div>
        )}
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

          {processingStage === 'error' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
              <SafeIcon icon={FiAlertCircle} className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Password Reset Error</h3>
              <p className="text-yellow-700 mb-4">
                {statusMessage || 'This password reset link is invalid or has expired.'}
              </p>
              <p className="text-yellow-700 mb-4">
                Please request a new password reset link to continue.
              </p>
              <a 
                href="/#/forgot-password" 
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                Request New Reset Link
              </a>
            </div>
          ) : (
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

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <SafeIcon icon={FiKey} className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Password Requirements</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 pl-7">
                  <li>At least 6 characters long</li>
                  <li>Contains a mix of letters and numbers (recommended)</li>
                  <li>Avoid common words and patterns</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || processingStage !== 'ready'}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

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