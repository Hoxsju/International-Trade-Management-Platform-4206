import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import BuyerDashboard from './BuyerDashboard'
import SupplierDashboard from './SupplierDashboard'
import AdminDashboard from './AdminDashboard'

const DashboardRouter = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user, retryCount])

  const fetchUserProfile = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📊 Fetching user profile for:', user.id, user.email)
      
      // Special handling for admin account
      if (user.email === 'hoxs@regravity.net') {
        console.log('🔑 Admin user detected, ensuring profile exists...')
        
        let profileResult = await ProfileService.getUserProfile(user.id)
        
        // If admin profile doesn't exist, fix it
        if (profileResult.error || !profileResult.data) {
          console.log('🔧 Admin profile issue, fixing it...')
          
          try {
            const { supabase } = await import('../../config/supabase')
            
            // Check for existing admin profile
            const { data: existingProfiles } = await supabase
              .from('user_profiles_rg2024')
              .select('*')
              .eq('email', 'hoxs@regravity.net')
            
            if (existingProfiles && existingProfiles.length > 0) {
              // Update existing profile with correct auth ID
              console.log('🔧 Updating existing admin profile...')
              
              const { data: updatedProfile, error: updateError } = await supabase
                .from('user_profiles_rg2024')
                .update({ 
                  id: user.id,
                  updated_at: new Date().toISOString()
                })
                .eq('email', 'hoxs@regravity.net')
                .select()
                .single()
              
              if (!updateError && updatedProfile) {
                setUserProfile(updatedProfile)
                console.log('✅ Admin profile updated successfully')
                return
              }
            }
            
            // Create new admin profile with unique user_id
            const uniqueAdminId = 'ADM' + Date.now().toString().slice(-6)
            const adminProfileData = {
              id: user.id,
              user_id: uniqueAdminId,
              email: 'hoxs@regravity.net',
              full_name: 'Hoxs Admin',
              phone: '+852-1234-5678',
              company_name: 'Regravity Ltd',
              account_type: 'admin',
              status: 'active',
              email_verified: true,
              verification_method: 'manual_admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles_rg2024')
              .insert([adminProfileData])
              .select()
              .single()
            
            if (createError) {
              throw new Error(`Admin profile creation failed: ${createError.message}`)
            }
            
            setUserProfile(newProfile)
            console.log('✅ New admin profile created successfully')
            return
            
          } catch (adminError) {
            throw new Error(`Admin profile fix failed: ${adminError.message}`)
          }
        }
        
        setUserProfile(profileResult.data)
        console.log('🔑 Welcome Admin! You have full platform access.')
        return
      }

      // Regular profile fetch for non-admin users
      const profileResult = await ProfileService.getUserProfile(user.id)
      
      if (profileResult.error) {
        console.error('❌ Profile fetch error:', profileResult.error)
        throw profileResult.error
      }

      if (!profileResult.data) {
        throw new Error('No profile data returned')
      }

      console.log('✅ User profile loaded:', profileResult.data)
      setUserProfile(profileResult.data)

    } catch (error) {
      console.error('💥 Dashboard profile fetch error:', error)
      
      let errorMessage = 'Failed to load user profile.'
      
      if (error.message.includes('Profile not found') || error.message.includes('no rows')) {
        errorMessage = 'Your profile was not found. This may be because registration was not completed properly.'
      } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        errorMessage = 'Profile conflict detected. Please try again or contact support.'
      } else if (error.message.includes('multiple') && error.message.includes('rows')) {
        errorMessage = 'Multiple profiles found for your account. Please contact support to resolve this issue.'
      } else if (error.message.includes('not authenticated')) {
        errorMessage = 'Authentication error. Please sign out and sign back in.'
      } else if (error.message.includes('incomplete')) {
        errorMessage = 'Your profile is incomplete. Please complete the registration process.'
      } else if (error.message.includes('table') || error.message.includes('connection')) {
        errorMessage = 'Database connection issue. Please try again in a moment.'
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  const handleAdminFix = async () => {
    if (user && user.email === 'hoxs@regravity.net') {
      setLoading(true)
      try {
        console.log('🔧 Manual admin profile fix...')
        const { supabase } = await import('../../config/supabase')
        
        // Delete any conflicting profiles first
        await supabase
          .from('user_profiles_rg2024')
          .delete()
          .eq('email', 'hoxs@regravity.net')
        
        // Create fresh admin profile
        const uniqueAdminId = 'ADM' + Date.now().toString().slice(-6)
        const adminProfileData = {
          id: user.id,
          user_id: uniqueAdminId,
          email: 'hoxs@regravity.net',
          full_name: 'Hoxs Admin',
          phone: '+852-1234-5678',
          company_name: 'Regravity Ltd',
          account_type: 'admin',
          status: 'active',
          email_verified: true,
          verification_method: 'manual_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles_rg2024')
          .insert([adminProfileData])
          .select()
          .single()
        
        if (createError) {
          throw new Error(`Manual admin fix failed: ${createError.message}`)
        }
        
        setUserProfile(newProfile)
        setError('')
        console.log('✅ Manual admin profile fix successful')
        
      } catch (error) {
        console.error('❌ Manual admin fix failed:', error)
        setError(`Manual fix failed: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCompleteTest = () => {
    window.location.href = '/#/complete-test'
  }

  const handleSignOut = async () => {
    try {
      const { supabase } = await import('../../config/supabase')
      await supabase.auth.signOut()
      window.location.href = '/#/'
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.href = '/#/'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleCompleteTest}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enhanced Auth Test
            </button>
            <button
              onClick={() => window.location.href = '/#/register'}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Complete Registration
            </button>
            <button
              onClick={handleSignOut}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Sign Out & Start Fresh
            </button>
          </div>
          
          {/* Special admin fix button */}
          {user && user.email === 'hoxs@regravity.net' && (
            <div className="mt-4">
              <button
                onClick={handleAdminFix}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                🔧 Fix Admin Profile (Force Clean)
              </button>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Enhanced Auth Available:</strong> Try the new authentication system that handles all email verification automatically.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Profile Not Found</h3>
          <p className="text-yellow-700 mb-4">
            Your user profile could not be found. Please complete the registration process.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleRetry}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleCompleteTest}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Enhanced Auth Test
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>The enhanced authentication system can help resolve profile issues automatically.</p>
          </div>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on account type
  const renderDashboard = () => {
    const accountType = userProfile.account_type
    console.log('🎯 Routing to dashboard for account type:', accountType)

    switch (accountType) {
      case 'buyer':
        return <BuyerDashboard userProfile={userProfile} />
      case 'supplier':
        return <SupplierDashboard userProfile={userProfile} />
      case 'admin':
        return <AdminDashboard userProfile={userProfile} />
      default:
        return (
          <div className="max-w-2xl mx-auto p-8">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unknown Account Type</h3>
              <p className="text-gray-700 mb-4">
                Account type "{accountType}" is not recognized. Please contact support or update your profile.
              </p>
              
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Account Type:</strong> {accountType}</p>
                <p><strong>Profile ID:</strong> {userProfile.user_id}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => window.location.href = '/#/register'}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => window.location.href = '/#/contact'}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderDashboard()}
    </div>
  )
}

export default DashboardRouter