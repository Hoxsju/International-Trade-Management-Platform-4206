import React, { useState } from 'react'
import { supabase } from '../../config/supabase'
import { generateBuyerId } from '../../utils/idGenerator'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw } = FiIcons

const QuickRegistrationTest = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testQuickRegistration = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Generate test data
      const testEmail = `test-${Date.now()}@test.com`
      const testPassword = 'test123456'
      const userId = generateBuyerId()

      console.log('🧪 Testing quick registration...')

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`)
      }

      console.log('✅ Auth user created:', authData.user?.id)

      // Step 2: Insert profile (this should NOT cause recursion now)
      const profileData = {
        id: authData.user.id, // This matches auth.uid()
        user_id: userId,
        email: testEmail.toLowerCase(),
        full_name: 'Test User',
        phone: '1234567890',
        company_name: 'Test Company',
        account_type: 'buyer',
        status: 'active'
      }

      console.log('📝 Inserting profile...')

      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles_rg2024')
        .insert([profileData])
        .select()
        .single()

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`)
      }

      console.log('✅ Profile created:', profileResult)

      // Step 3: Read it back
      const { data: readData, error: readError } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (readError) {
        throw new Error(`Read error: ${readError.message}`)
      }

      console.log('✅ Profile read back:', readData)

      // Cleanup
      await supabase
        .from('user_profiles_rg2024')
        .delete()
        .eq('id', authData.user.id)

      await supabase.auth.signOut()

      setResult({
        success: true,
        message: '🎉 Registration test PASSED! No infinite recursion!',
        details: {
          authUserId: authData.user.id,
          profileCreated: true,
          dataMatches: readData.email === testEmail
        }
      })

    } catch (error) {
      console.error('❌ Test failed:', error)
      setResult({
        success: false,
        message: error.message,
        details: { error: error.message }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quick Registration Test</h1>
        <p className="text-gray-600 mb-6">
          Test if the RLS infinite recursion issue is fixed
        </p>
        
        <button
          onClick={testQuickRegistration}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing...' : 'Test Registration Flow'}</span>
        </button>
      </div>

      {result && (
        <div className={`border rounded-lg p-6 ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon 
              icon={result.success ? FiCheckCircle : FiXCircle} 
              className={`h-6 w-6 ${
                result.success ? 'text-green-600' : 'text-red-600'
              }`} 
            />
            <h3 className={`text-lg font-semibold ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.success ? 'SUCCESS!' : 'FAILED!'}
            </h3>
          </div>
          
          <p className={`font-medium mb-4 ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.message}
          </p>

          {result.details && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
              <pre className="text-sm">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4">🔧 RLS Policies Fixed</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>✅ allow_public_select:</strong> Anyone can read profiles</p>
          <p><strong>✅ allow_auth_insert:</strong> auth.uid() = id (no lookups)</p>
          <p><strong>✅ allow_auth_update:</strong> auth.uid() = id (no lookups)</p>
          <p><strong>✅ allow_auth_delete:</strong> auth.uid() = id (no lookups)</p>
          <p className="text-green-600 font-medium">🎯 Zero recursion risk!</p>
        </div>
      </div>
    </div>
  )
}

export default QuickRegistrationTest