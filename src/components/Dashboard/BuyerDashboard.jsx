import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import { EmailService } from '../../services/emailService'
import ServiceOrdersSection from './ServiceOrdersSection'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const {
  FiPlus, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiSend, FiUsers, 
  FiMail, FiCopy, FiAlertTriangle, FiTool, FiUser, FiEdit, FiSave, FiX, FiPhone,
  FiBuilding, FiMapPin, FiGlobe, FiMessageSquare, FiShield
} = FiIcons

// Profile Modal Component
const ProfileModal = ({ userProfile, onClose, onSave, loading }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    if (userProfile) {
      setEditData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        company_name: userProfile.company_name || '',
        chinese_company_name: userProfile.chinese_company_name || '',
        business_license: userProfile.business_license || '',
        official_address: userProfile.official_address || '',
        wechat_id: userProfile.wechat_id || ''
      })
    }
  }, [userProfile])

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await onSave(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Profile</h3>
              <p className="text-sm text-gray-600">{userProfile?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userProfile?.status)}`}>
                  {userProfile?.status?.toUpperCase()}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {userProfile?.account_type?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <SafeIcon icon={FiEdit} className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditData({
                      full_name: userProfile.full_name || '',
                      phone: userProfile.phone || '',
                      company_name: userProfile.company_name || '',
                      chinese_company_name: userProfile.chinese_company_name || '',
                      business_license: userProfile.business_license || '',
                      official_address: userProfile.official_address || '',
                      wechat_id: userProfile.wechat_id || ''
                    })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                </button>
              </div>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiX} className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.full_name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <p className="text-gray-900 bg-gray-100 p-3 rounded border">
                  {userProfile?.email}
                  {userProfile?.email_verified && (
                    <SafeIcon icon={FiCheckCircle} className="inline h-4 w-4 ml-2 text-green-500" />
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiPhone} className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <p className="text-gray-900 bg-gray-100 p-3 rounded border font-mono text-sm">{userProfile?.user_id}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiBuilding} className="inline h-4 w-4 mr-1" />
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.company_name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiGlobe} className="inline h-4 w-4 mr-1" />
                  Chinese Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.chinese_company_name}
                    onChange={(e) => handleInputChange('chinese_company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="公司中文名称 (可选)"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.chinese_company_name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiShield} className="inline h-4 w-4 mr-1" />
                  Business License
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.business_license}
                    onChange={(e) => handleInputChange('business_license', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.business_license || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
                  WeChat ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.wechat_id}
                    onChange={(e) => handleInputChange('wechat_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">{userProfile?.wechat_id || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMapPin} className="inline h-4 w-4 mr-1" />
                  Official Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.official_address}
                    onChange={(e) => handleInputChange('official_address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-line">{userProfile?.official_address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                  {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Invitation Modal with manual fallback and FIXED positioning
const InvitationModal = ({ onClose, userProfile }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    accountType: 'buyer',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [showManualFallback, setShowManualFallback] = useState(false)
  const [manualText, setManualText] = useState('')

  // Scroll to top when modal opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // FIXED: Only require name and email - company is now optional
    if (!formData.name || !formData.email) {
      alert('Please fill in name and email (company is optional)')
      return
    }

    setLoading(true)
    try {
      console.log('📧 Sending invitation from buyer dashboard...')
      const senderInfo = {
        name: userProfile?.full_name || 'Team Member',
        company: userProfile?.company_name || 'Company',
        email: userProfile?.email || 'contact@company.com'
      }

      const invitationData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        company: formData.company.trim() || 'Not specified', // FIXED: Default if empty
        accountType: formData.accountType,
        message: formData.message
      }

      if (formData.accountType === 'buyer') {
        await EmailService.sendBuyerInvitation(invitationData, senderInfo)
      } else {
        await EmailService.sendSupplierInvitationFromDashboard(invitationData, senderInfo)
      }

      alert('✅ Invitation sent successfully!')
      onClose()
    } catch (error) {
      console.error('❌ Invitation failed:', error)
      // Show manual fallback if email fails
      if (error.message.includes('Email service') || error.message.includes('temporarily unavailable')) {
        console.log('📧 Email failed, showing manual invitation option')
        const senderInfo = {
          name: userProfile?.full_name || 'Team Member',
          company: userProfile?.company_name || 'Company',
          email: userProfile?.email || 'contact@company.com'
        }

        let fallbackData
        if (formData.accountType === 'buyer') {
          fallbackData = {
            email: formData.email,
            name: formData.name,
            senderName: senderInfo.name,
            senderCompany: senderInfo.company
          }
          setManualText(EmailService.createManualFallbackText('buyer_invitation', fallbackData))
        } else {
          fallbackData = {
            email: formData.email,
            name: formData.name,
            senderName: senderInfo.name,
            senderCompany: senderInfo.company
          }
          setManualText(EmailService.createManualFallbackText('supplier_invitation', fallbackData))
        }
        setShowManualFallback(true)
      } else {
        alert(`❌ ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualText)
    alert('Invitation text copied to clipboard!')
  }

  if (showManualFallback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">Manual Invitation - Email Service Unavailable</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiXCircle} className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Email Service Temporarily Unavailable</span>
              </div>
              <p className="text-yellow-700 text-sm">
                The automated email invitation system is currently experiencing issues. Please copy the invitation text below and send it manually.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Manual Invitation Text</h4>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  <SafeIcon icon={FiCopy} className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                value={manualText}
                readOnly
                rows={12}
                className="w-full p-3 border border-gray-300 rounded font-mono text-sm bg-white"
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-blue-800 text-sm space-y-1">
                <li>1. Click "Copy" to copy the invitation text</li>
                <li>2. Send this text to: <strong>{formData.email}</strong></li>
                <li>3. You can send it via email, messaging app, or any communication method</li>
                <li>4. The recipient will receive the registration link and instructions</li>
              </ol>
            </div>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiCopy} className="h-4 w-4" />
              <span>Copy Invitation</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Invite to Platform</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiXCircle} className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter company name (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add a personal message to the invitation..."
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <SafeIcon icon={FiMail} className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Invitation Preview</span>
            </div>
            <p className="text-xs text-blue-700">
              {formData.name || 'Recipient'} will receive an email invitation to join Regravity as a {formData.accountType} from {userProfile?.company_name || 'your company'}.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.email}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiSend} className="h-4 w-4" />
            <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const BuyerDashboard = ({ userProfile }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0
  })
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileSaveLoading, setProfileSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'services'

  // Scroll to top when component mounts or when navigating
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (userProfile && user) {
      fetchOrders()
    }
  }, [userProfile, user])

  const handleSaveProfile = async (updatedData) => {
    setProfileSaveLoading(true)
    try {
      const result = await ProfileService.updateUserProfile(user.id, updatedData)
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      // Refresh the page to get updated profile data
      window.location.reload()
    } catch (error) {
      console.error('Profile update failed:', error)
      alert(`Failed to update profile: ${error.message}`)
    } finally {
      setProfileSaveLoading(false)
    }
  }

  // FIXED: Simplified order fetching without problematic joins
  const fetchOrders = async () => {
    if (!user?.id) {
      console.error('❌ No user ID available for fetching orders')
      setLoading(false)
      return
    }

    try {
      console.log('📊 Fetching orders for buyer:', user.id)
      
      // FIXED: Simple query without joins to avoid relationship errors
      const { data, error } = await supabase
        .from('trade_orders_rg2024')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('✅ Orders fetched successfully:', data)
      console.log('📊 Number of orders found:', data?.length || 0)

      // Log each order for debugging
      if (data && data.length > 0) {
        data.forEach((order, index) => {
          console.log(`📋 Order ${index + 1}:`, {
            id: order.id,
            order_id: order.order_id,
            status: order.status,
            buyer_id: order.buyer_id,
            supplier_name: order.supplier_name,
            deal_amount: order.deal_amount,
            created_at: order.created_at
          })
        })
      } else {
        console.log('📭 No orders found for this buyer')
      }

      setOrders(data || [])

      // FIXED: Enhanced stats calculation with debugging
      const calculatedStats = {
        total: data?.length || 0,
        pending: data?.filter(o => o.status === 'pending_review' || o.status === 'pending_supplier_registration').length || 0,
        active: data?.filter(o => ['approved', 'in_progress', 'payment_confirmed'].includes(o.status)).length || 0,
        completed: data?.filter(o => o.status === 'completed').length || 0
      }

      console.log('📊 Calculated stats:', calculatedStats)
      setStats(calculatedStats)
    } catch (error) {
      console.error('💥 Error fetching orders:', error)
      alert(`Error loading orders: ${error.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Add manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
  }

  const handleCreateOrder = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate('/create-order')
  }

  const handleInviteUser = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowInvitationModal(true)
  }

  const handleShowProfile = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowProfileModal(true)
  }

  const handleViewOrder = (orderId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate(`/order/${orderId}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review':
      case 'pending_supplier_registration':
        return 'text-yellow-600 bg-yellow-100'
      case 'approved':
        return 'text-blue-600 bg-blue-100'
      case 'payment_confirmed':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-purple-600 bg-purple-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'disputed':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_review':
      case 'pending_supplier_registration':
        return FiClock
      case 'approved':
        return FiCheckCircle
      case 'payment_confirmed':
        return FiCheckCircle
      case 'in_progress':
        return FiPackage
      case 'completed':
        return FiCheckCircle
      case 'rejected':
        return FiXCircle
      case 'disputed':
        return FiXCircle
      default:
        return FiClock
    }
  }

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'pending_review':
        return 'PENDING REVIEW'
      case 'pending_supplier_registration':
        return 'PENDING SUPPLIER'
      case 'approved':
        return 'APPROVED'
      case 'payment_confirmed':
        return 'PAYMENT CONFIRMED'
      case 'in_progress':
        return 'IN PROGRESS'
      case 'completed':
        return 'COMPLETED'
      case 'rejected':
        return 'REJECTED'
      case 'disputed':
        return 'DISPUTED'
      default:
        return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'
    }
  }

  // FIXED: Get supplier display name from order data
  const getSupplierDisplayName = (order) => {
    // Try different fields that might contain supplier info
    if (order.supplier_name) {
      return order.supplier_name
    }
    if (order.supplier_email) {
      return order.supplier_email
    }
    if (order.status === 'pending_supplier_registration') {
      return 'Pending Registration'
    }
    return 'Not Assigned'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
          <p className="text-sm text-gray-500">Company: {userProfile?.company_name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleShowProfile}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiUser} className="h-4 w-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPackage} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleInviteUser}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiUsers} className="h-4 w-4" />
            <span>Invite User</span>
          </button>
          <button
            onClick={handleCreateOrder}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* FIXED: Statistics Cards - Smaller Horizontal Layout */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center text-center min-h-[100px] justify-center">
          <SafeIcon icon={FiPackage} className="h-6 w-6 text-gray-400 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs font-medium text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center text-center min-h-[100px] justify-center">
          <SafeIcon icon={FiClock} className="h-6 w-6 text-yellow-400 mb-2" />
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs font-medium text-gray-600">Pending Review</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center text-center min-h-[100px] justify-center">
          <SafeIcon icon={FiPackage} className="h-6 w-6 text-blue-400 mb-2" />
          <p className="text-xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-xs font-medium text-gray-600">Active Orders</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center text-center min-h-[100px] justify-center">
          <SafeIcon icon={FiCheckCircle} className="h-6 w-6 text-green-400 mb-2" />
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs font-medium text-gray-600">Completed</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Trade Orders
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'services'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <SafeIcon icon={FiTool} className="h-4 w-4" />
            <span>Services</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <>
          {/* Debug Information (only show in development) */}
          {window.location.hostname === 'localhost' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🔧 Debug Information:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Orders Found:</strong> {orders.length}</p>
                <p><strong>Stats:</strong> Total: {stats.total}, Pending: {stats.pending}, Active: {stats.active}, Completed: {stats.completed}</p>
                <p><strong>Last Fetch:</strong> {new Date().toLocaleTimeString()}</p>
                <p><strong>Query Status:</strong> ✅ Simple query (no joins)</p>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <SafeIcon icon={FiPackage} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Create your first trade order to get started</p>
                <button
                  onClick={handleCreateOrder}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Create Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getSupplierDisplayName(order)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">{order.product_description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.deal_amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <SafeIcon icon={getStatusIcon(order.status)} className="h-3 w-3 mr-1" />
                            {getStatusDisplayText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewOrder(order.order_id)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                          >
                            <SafeIcon icon={FiEye} className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'services' && (
        <ServiceOrdersSection userProfile={userProfile} />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userProfile={userProfile}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          loading={profileSaveLoading}
        />
      )}

      {/* Invitation Modal */}
      {showInvitationModal && (
        <InvitationModal
          onClose={() => setShowInvitationModal(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  )
}

export default BuyerDashboard