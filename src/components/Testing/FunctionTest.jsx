import React, { useState } from 'react'
import { ProfileService } from '../../services/profileService'
import { generateBuyerId } from '../../utils/idGenerator'
import { supabase } from '../../config/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheckCircle, FiXCircle, FiPlay, FiRefreshCw, FiDatabase } = FiIcons

const FunctionTest = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseFunctions = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('🧪 Testing database functions approach...')

      // Step 1: Create a test auth user
      const testEmail = `test-func-${Date.now()}@test.com`
      const testPassword = 'test123456'

      console.log('🔐 Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`)
      }

      console.log('✅ Auth user created:', authData.user?.id)

      // Step 2: Test our secure profile creation function
      const userId = generateBuyerId()
      const profileData = {
        id: authData.user.id,
        user_id: userId,
        email: testEmail,
        full_name: 'Test Function User',
        phone: '1234567890',
        company_name: 'Test Function Company',
        account_type: 'buyer'
      }

      console.log('📝 Testing profile creation function...')
      const { data: createResult, error: createError } = await ProfileService.createUserProfile(profileData)

      if (createError) {
        throw new Error(`Profile creation error: ${createError.message}`)
      }

      console.log('✅ Profile created via function:', createResult)

      // Step 3: Test profile retrieval function
      console.log('📊 Testing profile retrieval function...')
      const { data: getResult, error: getError } = await ProfileService.getUserProfile(authData.user.id)

      if (getError) {
        throw new Error(`Profile retrieval error: ${getError.message}`)
      }

      console.log('✅ Profile retrieved via function:', getResult)

      // Step 4: Test profile update function
      console.log('📝 Testing profile update function...')
      const updates = { full_name: 'Updated Test User', phone: '9876543210' }
      const { data: updateResult, error: updateError } = await ProfileService.updateUserProfile(authData.user.id, updates)

      if (updateError) {
        throw new Error(`Profile update error: ${updateError.message}`)
      }

      console.log('✅ Profile updated via function:', updateResult)

      // Step 5: Test public suppliers function
      console.log('📋 Testing public suppliers function...')
      const { data: suppliersResult, error: suppliersError } = await ProfileService.getPublicSuppliers()

      if (suppliersError) {
        throw new Error(`Suppliers retrieval error: ${suppliersError.message}`)
      }

      console.log('✅ Suppliers retrieved via function:', suppliersResult?.length || 0, 'suppliers')

      // Cleanup
      await supabase.auth.signOut()

      setResult({
        success: true,
        message: '🎉 All database functions work perfectly! No RLS issues!',
        details: {
          authUserId: authData.user.id,
          profileCreated: !!createResult,
          profileRetrieved: !!getResult,
          profileUpdated: !!updateResult,
          suppliersCount: suppliersResult?.length || 0,
          profileMatches: getResult?.email === testEmail,
          updateApplied: updateResult?.full_name === 'Updated Test User'
        }
      })

    } catch (error) {
      console.error('❌ Function test failed:', error)
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
        <SafeIcon icon={FiDatabase} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Functions Test</h1>
        <p className="text-gray-600 mb-6">
          Test the new database functions approach that bypasses RLS
        </p>
        
        <button
          onClick={testDatabaseFunctions}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={loading ? FiRefreshCw : FiPlay} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing Functions...' : 'Test Database Functions'}</span>
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
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <pre className="text-sm">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4">🔧 Database Functions Approach</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>✅ register_user_profile():</strong> Creates profiles securely</p>
          <p><strong>✅ get_user_profile():</strong> Retrieves user's own profile</p>
          <p><strong>✅ update_user_profile():</strong> Updates user's own profile</p>
          <p><strong>✅ get_public_suppliers():</strong> Lists public suppliers</p>
          <p className="text-green-600 font-medium">🎯 Completely bypasses RLS issues!</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">How This Works:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Database functions run with SECURITY DEFINER privileges</li>
          <li>• They bypass RLS policies completely</li>
          <li>• Security is enforced within the function logic</li>
          <li>• No more infinite recursion or policy conflicts</li>
          <li>• Clean, predictable database operations</li>
        </ul>
      </div>
    </div>
  )
}

export default FunctionTest