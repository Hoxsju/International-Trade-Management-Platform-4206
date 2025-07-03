import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import { supabase } from '../../config/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiDatabase, FiCheckCircle, FiXCircle, FiRefreshCw } = FiIcons

const ProfileDebugTest = () => {
  const { user } = useAuth()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const updateResult = (test, status, message, data = null) => {
    setResults(prev => ({
      ...prev,
      [test]: { status, message, data, timestamp: new Date().toISOString() }
    }))
  }

  const runProfileTests = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    setLoading(true)
    setResults({})

    try {
      // Test 1: Check if user exists in auth
      updateResult('auth_check', 'running', 'Checking authentication...')
      updateResult('auth_check', 'success', 'User authenticated', {
        id: user.id,
        email: user.email,
        aud: user.aud
      })

      // Test 2: Try direct table query
      updateResult('direct_query', 'running', 'Testing direct table access...')
      try {
        const { data: directData, error: directError } = await supabase
          .from('user_profiles_rg2024')
          .select('*')
          .eq('id', user.id)
          .single()

        if (directError) {
          updateResult('direct_query', 'error', `Direct query failed: ${directError.message}`)
        } else if (directData) {
          updateResult('direct_query', 'success', 'Direct query successful', directData)
        } else {
          updateResult('direct_query', 'warning', 'No profile found with direct query')
        }
      } catch (error) {
        updateResult('direct_query', 'error', `Direct query exception: ${error.message}`)
      }

      // Test 3: Try function call
      updateResult('function_call', 'running', 'Testing function call...')
      try {
        const functionResult = await ProfileService.getUserProfile(user.id)
        
        if (functionResult.error) {
          updateResult('function_call', 'error', `Function failed: ${functionResult.error.message}`, functionResult.error)
        } else {
          updateResult('function_call', 'success', 'Function call successful', functionResult.data)
        }
      } catch (error) {
        updateResult('function_call', 'error', `Function exception: ${error.message}`)
      }

      // Test 4: List all profiles (to see if table has data)
      updateResult('table_scan', 'running', 'Scanning table for any profiles...')
      try {
        const { data: allProfiles, error: scanError } = await supabase
          .from('user_profiles_rg2024')
          .select('id, email, account_type')
          .limit(10)

        if (scanError) {
          updateResult('table_scan', 'error', `Table scan failed: ${scanError.message}`)
        } else {
          updateResult('table_scan', 'success', `Found ${allProfiles?.length || 0} profiles in table`, allProfiles)
        }
      } catch (error) {
        updateResult('table_scan', 'error', `Table scan exception: ${error.message}`)
      }

      // Test 5: Check if functions exist
      updateResult('function_exists', 'running', 'Checking if functions exist...')
      try {
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_public_suppliers')

        if (functionError) {
          updateResult('function_exists', 'error', `Function doesn't exist: ${functionError.message}`)
        } else {
          updateResult('function_exists', 'success', 'Functions exist and working', functionData)
        }
      } catch (error) {
        updateResult('function_exists', 'error', `Function check exception: ${error.message}`)
      }

    } catch (error) {
      updateResult('general_error', 'error', `General error: ${error.message}`)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return FiCheckCircle
      case 'error': return FiXCircle
      case 'running': return FiRefreshCw
      default: return FiDatabase
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <SafeIcon icon={FiUser} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Debug Test</h1>
        <p className="text-gray-600 mb-6">
          Debug profile loading issues
        </p>
        
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-800">
              <strong>Logged in as:</strong> {user.email} (ID: {user.id})
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">Please log in to run profile tests</p>
          </div>
        )}

        <button
          onClick={runProfileTests}
          disabled={loading || !user}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={loading ? FiRefreshCw : FiDatabase} className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Running Tests...' : 'Run Profile Debug Tests'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
            <div className="flex items-center space-x-3 mb-2">
              <SafeIcon 
                icon={getStatusIcon(result.status)} 
                className={`h-5 w-5 ${result.status === 'running' ? 'animate-spin' : ''}`} 
              />
              <h3 className="font-semibold capitalize">
                {testName.replace(/_/g, ' ')}
              </h3>
            </div>
            
            <p className="font-medium mb-2">{result.message}</p>
            
            {result.data && (
              <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                <pre className="text-xs overflow-auto max-h-40">
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

      {Object.keys(results).length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <SafeIcon icon={FiDatabase} className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Click "Run Profile Debug Tests" to diagnose issues</p>
        </div>
      )}
    </div>
  )
}

export default ProfileDebugTest