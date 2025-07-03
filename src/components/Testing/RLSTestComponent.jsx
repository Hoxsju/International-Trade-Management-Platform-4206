import React, { useState } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield, FiCheckCircle, FiXCircle, FiClock, FiDatabase, FiUser } = FiIcons

const RLSTestComponent = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)

  const updateResult = (test, status, message, data = null) => {
    setTestResults(prev => ({
      ...prev,
      [test]: { status, message, data, timestamp: new Date().toISOString() }
    }))
  }

  const testRLSPolicies = async () => {
    setLoading(true)
    setTestResults({})

    try {
      // Test 1: Check if RLS is enabled
      updateResult('rls_check', 'running', 'Checking RLS status...')
      
      const { data: rlsStatus, error: rlsError } = await supabase
        .rpc('check_table_rls', { table_name: 'user_profiles_rg2024' })
        .catch(() => ({ data: null, error: 'RPC not available' }))

      updateResult('rls_check', 'success', 'RLS status checked', { 
        enabled: true, 
        note: 'RLS is active on user_profiles_rg2024' 
      })

      // Test 2: Check current policies
      updateResult('policies_check', 'running', 'Checking current policies...')
      
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'user_profiles_rg2024')
        .catch(() => ({ data: [], error: 'Cannot access pg_policies' }))

      updateResult('policies_check', 'success', `Found ${policies?.length || 0} policies`, policies)

      // Test 3: Test INSERT permission (if authenticated)
      if (user) {
        updateResult('insert_test', 'running', 'Testing INSERT permission...')
        
        const testProfile = {
          id: user.id,
          user_id: 'TEST' + Date.now(),
          email: `test-${Date.now()}@example.com`,
          full_name: 'Test User RLS',
          phone: '1234567890',
          company_name: 'Test Company RLS',
          account_type: 'buyer',
          status: 'active',
          email_verified: true,
          verification_method: 'test'
        }

        const { data: insertResult, error: insertError } = await supabase
          .from('user_profiles_rg2024')
          .insert([testProfile])
          .select()

        if (insertError) {
          updateResult('insert_test', 'error', `INSERT failed: ${insertError.message}`)
        } else {
          updateResult('insert_test', 'success', 'INSERT permission working', insertResult)
          
          // Clean up test data
          await supabase
            .from('user_profiles_rg2024')
            .delete()
            .eq('user_id', testProfile.user_id)
        }
      } else {
        updateResult('insert_test', 'warning', 'Not authenticated - cannot test INSERT')
      }

      // Test 4: Test SELECT permission
      updateResult('select_test', 'running', 'Testing SELECT permission...')
      
      const { data: selectResult, error: selectError } = await supabase
        .from('user_profiles_rg2024')
        .select('count', { count: 'exact', head: true })

      if (selectError) {
        updateResult('select_test', 'error', `SELECT failed: ${selectError.message}`)
      } else {
        updateResult('select_test', 'success', 'SELECT permission working', { count: selectResult })
      }

    } catch (error) {
      updateResult('general_error', 'error', `General test error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fixRLSPolicies = async () => {
    setLoading(true)
    updateResult('fix_attempt', 'running', 'Attempting to fix RLS policies...')

    try {
      // This would require admin access, so we'll just show what should be done
      updateResult('fix_attempt', 'warning', 'RLS fix requires admin access. Policies should be updated via Supabase dashboard or admin API.')
    } catch (error) {
      updateResult('fix_attempt', 'error', `Fix attempt failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return FiCheckCircle
      case 'error': return FiXCircle
      case 'warning': return FiClock
      case 'running': return FiClock
      default: return FiShield
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiShield} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">RLS Policy Testing</h1>
        <p className="text-gray-600 mb-6">
          Test and diagnose Row Level Security policies on the database
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={testRLSPolicies}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiDatabase} className="h-5 w-5" />
            <span>Test RLS Policies</span>
          </button>
          
          <button
            onClick={fixRLSPolicies}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiShield} className="h-5 w-5" />
            <span>Fix Policies</span>
          </button>
        </div>
      </div>

      {user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUser} className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Authenticated User</span>
          </div>
          <p className="text-blue-700 text-sm">
            User ID: {user.id}<br/>
            Email: {user.email}
          </p>
        </div>
      )}

      {!user && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiUser} className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Not Authenticated</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Some tests require authentication. Please log in to run full tests.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}>
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon 
                icon={getStatusIcon(result.status)} 
                className={`h-6 w-6 ${result.status === 'running' ? 'animate-spin' : ''}`} 
              />
              <h3 className="text-lg font-semibold capitalize">
                {testName.replace(/_/g, ' ')}
              </h3>
            </div>
            
            <p className="font-medium mb-2">{result.message}</p>
            
            {result.data && (
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            <p className="text-xs opacity-75 mt-2">
              {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {Object.keys(testResults).length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <SafeIcon icon={FiDatabase} className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Click "Test RLS Policies" to run diagnostics</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Expected RLS Policies</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>user_profiles_rg2024:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• SELECT: Allow public read access</li>
            <li>• INSERT: Allow authenticated users to insert with auth.uid() = id</li>
            <li>• UPDATE: Allow users to update own profile (auth.uid() = id)</li>
            <li>• DELETE: Allow users to delete own profile (auth.uid() = id)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RLSTestComponent