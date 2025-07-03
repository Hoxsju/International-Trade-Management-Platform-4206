import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiBuilding, FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiUsers, FiSend, FiMail, FiCopy } = FiIcons

// Enhanced Supplier Invitation Modal with manual fallback and FIXED positioning
const SupplierInvitationModal = ({ onClose, userProfile }) => {
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
      console.log('📧 Sending invitation from supplier dashboard...')
      
      const senderInfo = {
        name: userProfile?.full_name || 'Supplier',
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
      console.error('❌ Supplier invitation failed:', error)
      
      // Show manual fallback if email fails
      if (error.message.includes('Email service') || error.message.includes('temporarily unavailable')) {
        console.log('📧 Email failed, showing manual invitation option')
        
        const senderInfo = {
          name: userProfile?.full_name || 'Supplier',
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
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
            >
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
          <h3 className="text-lg font-semibold text-gray-900">Invite Business Partner</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
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
            <p className="text-xs text-gray-500 mt-1">
              Invite them as a {formData.accountType} to connect and do business together
            </p>
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
              placeholder="Add a personal message about your business relationship..."
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <SafeIcon icon={FiMail} className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Supplier Invitation</span>
            </div>
            <p className="text-xs text-green-700">
              {formData.name || 'Recipient'} will receive an invitation to join Regravity from {userProfile?.company_name || 'your company'} and can start doing business with verified partners.
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

const SupplierDashboard = ({ userProfile }) => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvitationModal, setShowInvitationModal] = useState(false)

  useEffect(() => {
    if (userProfile) {
      fetchOrders()
    }
  }, [userProfile])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_orders_rg2024')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'trusted': return 'text-blue-600 bg-blue-100'
      case 'under_risk': return 'text-yellow-600 bg-yellow-100'
      case 'blacklisted': return 'text-red-600 bg-red-100'
      case 'pending_verification': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return FiCheckCircle
      case 'trusted': return FiShield
      case 'under_risk': return FiAlertTriangle
      case 'blacklisted': return FiXCircle
      case 'pending_verification': return FiAlertTriangle
      default: return FiUser
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
          <p className="text-sm text-gray-500">Company: {userProfile?.company_name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowInvitationModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiUsers} className="h-4 w-4" />
            <span>Invite Partner</span>
          </button>
        </div>
      </div>

      {/* Profile Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Supplier Status</h2>
          {userProfile?.supplier_status && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userProfile.supplier_status)}`}>
              <SafeIcon icon={getStatusIcon(userProfile.supplier_status)} className="h-4 w-4 mr-1" />
              {userProfile.supplier_status.replace('_', ' ').toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Company Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Company:</strong> {userProfile?.company_name}</p>
              <p><strong>Chinese Name:</strong> {userProfile?.chinese_company_name || 'Not provided'}</p>
              <p><strong>Business License:</strong> {userProfile?.business_license || 'Not provided'}</p>
              <p><strong>Address:</strong> {userProfile?.official_address || 'Not provided'}</p>
              {userProfile?.wechat_id && <p><strong>WeChat:</strong> {userProfile.wechat_id}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {userProfile?.full_name}</p>
              <p><strong>Email:</strong> {userProfile?.email}</p>
              <p><strong>Phone:</strong> {userProfile?.phone || 'Not provided'}</p>
              <p><strong>User ID:</strong> {userProfile?.user_id}</p>
            </div>
          </div>
        </div>

        {userProfile?.supplier_status === 'pending_verification' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                Your supplier profile is pending verification. Our team will review your information and update your status within 2-3 business days.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Orders Received</h2>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiBuilding} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders from buyers will appear here once they select your company</p>
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
                    Buyer
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.buyer_company}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{order.product_description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.deal_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {showInvitationModal && (
        <SupplierInvitationModal
          onClose={() => setShowInvitationModal(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  )
}

export default SupplierDashboard