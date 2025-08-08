import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiKey, FiLock, FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft } = FiIcons;

const EmergencyPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: password, 3: success
  const [userData, setUserData] = useState(null);
  
  const navigate = useNavigate();
  
  // Step 1: Find user by email
  const findUser = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if user exists
      const { data, error: userError } = await supabase
        .rpc('get_user_by_email', { email_to_find: email.toLowerCase() });
      
      if (userError) {
        throw userError;
      }
      
      if (!data || data.length === 0) {
        setError('No account found with this email address');
        setLoading(false);
        return;
      }
      
      // User found, proceed to password step
      setUserData(data[0]);
      setStep(2);
    } catch (error) {
      console.error('Error finding user:', error);
      setError('Failed to verify user. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Update password
  const updatePassword = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Use the admin function to reset password
      const { data, error: resetError } = await supabase
        .rpc('admin_reset_password', { 
          user_email: email.toLowerCase(),
          new_password: password
        });
      
      if (resetError) {
        throw resetError;
      }
      
      // Password updated successfully
      setStep(3);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      findUser();
    } else if (step === 2) {
      updatePassword();
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Password Reset</h2>
        <p className="text-gray-600 mt-2">
          {step === 1 && "Enter your email to begin the reset process"}
          {step === 2 && "Create a new secure password"}
          {step === 3 && "Your password has been reset successfully"}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <SafeIcon icon={FiCheckCircle} className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Password Reset Successful!</h3>
          <p className="text-green-700 mb-4">
            Your password has been updated successfully. You will be redirected to the login page in a moment.
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 mt-4"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your email address"
                required
              />
            </div>
          ) : step === 2 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" /> New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your new password"
                  minLength="6"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiLock} className="inline h-4 w-4 mr-1" /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Confirm your new password"
                  minLength="6"
                  required
                />
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
            </>
          ) : null}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : step === 1
              ? 'Continue'
              : 'Reset Password'}
          </button>
          
          <div className="mt-6 text-center">
            <a
              href="/#/login"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
            >
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-1" />
              <span>Back to Login</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmergencyPasswordReset;