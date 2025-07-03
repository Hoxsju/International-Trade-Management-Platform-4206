import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { EmailService } from '../../services/emailService'
import { OrderRequestService } from '../../services/orderRequestService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiArrowLeft, FiEdit, FiTrash2, FiSend, FiCheckCircle, FiXCircle, FiClock, FiPackage, FiDollarSign, FiUser, FiBuilding, FiMail, FiPhone, FiMessageSquare, FiAlertTriangle } = FiIcons

// Admin Request Modal Component
const AdminRequestModal = ({ order, requestType, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const isEdit = requestType === 'edit'
  const isCancel = requestType === 'cancel'

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for this request')
      return
    }
    onSubmit({ reason: reason.trim(), details: details.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Request {isEdit ? 'Order Edit' : 'Order Cancellation'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiXCircle} className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Order Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Order ID:</strong> {order.order_id}</p>
              <p><strong>Status:</strong> {order.status?.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Amount:</strong> ${order.deal_amount?.toLocaleString()}</p>
              <p><strong>Supplier:</strong> {order.supplier_name || 'Pending'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
              Reason for {isEdit ? 'Edit' : 'Cancellation'} Request *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={isEdit ? "Explain what needs to be edited and why..." : "Explain why you want to cancel this order..."}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={isEdit ? "Specify exactly what changes you want made..." : "Any additional information about the cancellation..."}
            />
          </div>

          <div className={`p-4 rounded-lg border ${isEdit ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiAlertTriangle} className={`h-5 w-5 ${isEdit ? 'text-yellow-600' : 'text-red-600'}`} />
              <span className={`font-medium ${isEdit ? 'text-yellow-800' : 'text-red-800'}`}>
                Important Notice
              </span>
            </div>
            <p className={`text-sm ${isEdit ? 'text-yellow-700' : 'text-red-700'}`}>
              {isEdit 
                ? "Your edit request will be sent to the admin team for review. Changes will only be made after admin approval."
                : "Your cancellation request will be sent to the admin team for review. The order will remain active until the request is approved."
              }
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center space-x-2 ${
              isEdit ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <SafeIcon icon={FiSend} className="h-4 w-4" />
            <span>{loading ? 'Sending...' : `Request ${isEdit ? 'Edit' : 'Cancellation'}`}</span>
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

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestType, setRequestType] = useState(null) // 'edit' or 'cancel'

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      console.log('📋 Fetching order details for:', orderId)
      
      const { data, error } = await supabase
        .from('trade_orders_rg2024')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        console.error('❌ Error fetching order:', error)
        throw error
      }

      if (!data) {
        throw new Error('Order not found')
      }

      console.log('✅ Order details loaded:', data)
      setOrder(data)
    } catch (error) {
      console.error('💥 Failed to fetch order details:', error)
      alert(`Error loading order: ${error.message}`)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminRequest = async (requestData) => {
    setRequestLoading(true)
    try {
      console.log('📧 Starting enhanced admin request...', requestType, requestData)
      
      // Validate required data
      if (!order?.order_id) {
        throw new Error('Order ID is missing')
      }
      if (!user?.id) {
        throw new Error('User ID is missing')
      }
      if (!requestData?.reason) {
        throw new Error('Request reason is required')
      }

      // Prepare request data
      const requestRecord = {
        order_id: order.order_id,
        buyer_id: user.id,
        request_type: requestType,
        reason: requestData.reason,
        details: requestData.details || ''
      }

      console.log('📝 Creating request with enhanced service...', requestRecord)

      // Try to create the request using the enhanced service
      let createResult = await OrderRequestService.createRequest(requestRecord)
      
      // If that fails, try the direct SQL approach
      if (!createResult.success) {
        console.log('🔄 Retrying with direct SQL approach...')
        createResult = await OrderRequestService.createRequestDirectSQL(requestRecord)
      }
      
      // If both fail, try a simple workaround
      if (!createResult.success) {
        console.log('🔄 Trying simple email-only approach...')
        
        // Just send the email notification without storing in database
        const emailSubject = requestType === 'edit' 
          ? `Order Edit Request - ${order.order_id}`
          : `Order Cancellation Request - ${order.order_id}`

        const emailMessage = `
URGENT ${requestType === 'edit' ? 'ORDER EDIT REQUEST' : 'ORDER CANCELLATION REQUEST'}

⚠️ Database storage failed - processing manually

Order Details:
- Order ID: ${order.order_id}
- Buyer: ${order.buyer_company}
- Buyer Email: ${user.email}
- Supplier: ${order.supplier_name || 'Pending'}
- Amount: $${order.deal_amount?.toLocaleString()}
- Current Status: ${order.status?.replace('_', ' ').toUpperCase()}

Request Details:
- Request Type: ${requestType === 'edit' ? 'Edit Order' : 'Cancel Order'}
- Reason: ${requestData.reason}
${requestData.details ? `- Additional Details: ${requestData.details}` : ''}
- Requested by: ${user.email}
- Request Time: ${new Date().toLocaleString()}

PLEASE PROCESS THIS REQUEST MANUALLY AND CONTACT THE BUYER.

Admin Dashboard: ${window.location.origin}/#/dashboard
        `.trim()

        await EmailService.sendContactForm({
          fullName: 'Order Request System (Manual)',
          email: 'admin@regravity.net',
          subject: emailSubject,
          message: emailMessage
        })

        console.log('✅ Request sent via email (manual processing)')
        
        setShowRequestModal(false)
        setRequestType(null)
        
        alert(`✅ ${requestType === 'edit' ? 'Edit' : 'Cancellation'} request sent successfully!\n\nNote: The request was sent via email for manual processing. The admin team will contact you directly.`)
        return
      }

      console.log('✅ Request created successfully:', createResult.data)

      // Send email notification to admin
      try {
        const emailSubject = requestType === 'edit' 
          ? `Order Edit Request - ${order.order_id}`
          : `Order Cancellation Request - ${order.order_id}`

        const emailMessage = `
${requestType === 'edit' ? 'ORDER EDIT REQUEST' : 'ORDER CANCELLATION REQUEST'}

Order Details:
- Order ID: ${order.order_id}
- Buyer: ${order.buyer_company}
- Supplier: ${order.supplier_name || 'Pending'}
- Amount: $${order.deal_amount?.toLocaleString()}
- Current Status: ${order.status?.replace('_', ' ').toUpperCase()}

Request Details:
- Requested by: ${user.email}
- Request Type: ${requestType === 'edit' ? 'Edit Order' : 'Cancel Order'}
- Reason: ${requestData.reason}
${requestData.details ? `- Additional Details: ${requestData.details}` : ''}

Please review this request in the admin dashboard.

Admin Dashboard: ${window.location.origin}/#/dashboard
        `.trim()

        await EmailService.sendContactForm({
          fullName: 'Order Request System',
          email: 'admin@regravity.net',
          subject: emailSubject,
          message: emailMessage
        })

        console.log('✅ Admin notification sent')
      } catch (emailError) {
        console.warn('⚠️ Failed to send admin notification:', emailError)
        // Don't fail the request if email fails
      }

      setShowRequestModal(false)
      setRequestType(null)
      
      alert(`✅ ${requestType === 'edit' ? 'Edit' : 'Cancellation'} request sent successfully! The admin team will review your request and contact you soon.`)
      
    } catch (error) {
      console.error('💥 Failed to send request:', error)
      
      // Provide more specific error messages
      let errorMessage = `Request failed: ${error.message}`
      
      if (error.message.includes('permission denied')) {
        errorMessage = 'Permission denied. Please contact support.'
      } else if (error.message.includes('table') && error.message.includes('does not exist')) {
        errorMessage = 'Database table missing. Please contact support to set up the request system.'
      }
      
      alert(`❌ ${errorMessage}`)
    } finally {
      setRequestLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': 
      case 'pending_supplier_registration': 
        return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-blue-600 bg-blue-100'
      case 'payment_confirmed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-purple-600 bg-purple-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'disputed': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_review': 
      case 'pending_supplier_registration': 
        return FiClock
      case 'approved': return FiCheckCircle
      case 'payment_confirmed': return FiCheckCircle
      case 'in_progress': return FiPackage
      case 'completed': return FiCheckCircle
      case 'rejected': return FiXCircle
      case 'disputed': return FiXCircle
      default: return FiClock
    }
  }

  const canRequestChanges = (status) => {
    // Can request changes for orders that haven't been completed or are in very early stages
    return ['pending_review', 'pending_supplier_registration', 'approved'].includes(status)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <SafeIcon icon={FiArrowLeft} className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* Action Buttons */}
        {canRequestChanges(order.status) && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setRequestType('edit')
                setShowRequestModal(true)
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiEdit} className="h-4 w-4" />
              <span>Request Edit</span>
            </button>
            <button
              onClick={() => {
                setRequestType('cancel')
                setShowRequestModal(true)
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiTrash2} className="h-4 w-4" />
              <span>Request Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h1>
            <p className="text-gray-600">Created on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            <SafeIcon icon={getStatusIcon(order.status)} className="h-4 w-4 mr-2" />
            {order.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiDollarSign} className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Deal Amount</p>
              <p className="font-semibold text-gray-900">${order.deal_amount?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiBuilding} className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Buyer Company</p>
              <p className="font-semibold text-gray-900">{order.buyer_company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiUser} className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Supplier</p>
              <p className="font-semibold text-gray-900">{order.supplier_name || 'Pending Registration'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Product Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                {order.product_description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deal Amount</label>
              <p className="text-2xl font-bold text-green-600">${order.deal_amount?.toLocaleString()}</p>
            </div>

            {order.service_cost > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Cost</label>
                <p className="text-lg font-semibold text-blue-600">${order.service_cost?.toLocaleString()}</p>
              </div>
            )}

            {order.total_amount && order.total_amount !== order.deal_amount && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Amount</label>
                <p className="text-2xl font-bold text-gray-900">${order.total_amount?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiBuilding} className="h-5 w-5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-gray-900">{order.supplier_name || 'Pending Registration'}</p>
              </div>
            </div>

            {order.supplier_email && (
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{order.supplier_email}</p>
                </div>
              </div>
            )}

            {order.supplier_phone && (
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiPhone} className="h-5 w-5 text-gray-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{order.supplier_phone}</p>
                </div>
              </div>
            )}

            {order.status === 'pending_supplier_registration' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiClock} className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Supplier Registration Pending</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  We have sent an invitation to the supplier. Your order will proceed once they complete their registration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Supplier Bank Account</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-line">
                {order.supplier_bank_account}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Services */}
        {order.selected_services && Object.keys(order.selected_services).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Services</h2>
            <div className="space-y-3">
              {Object.entries(order.selected_services).map(([serviceId, selected]) => {
                if (!selected) return null
                
                const serviceNames = {
                  verification: 'Supplier Business Verification',
                  inspection: 'On-site Quality Inspection',
                  testing: 'Laboratory Testing',
                  shipping: 'Shipping Coordination',
                  certificates: 'Certificate Request (CE, SGS, etc.)'
                }

                return (
                  <div key={serviceId} className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500" />
                    <span className="text-gray-900">{serviceNames[serviceId] || serviceId}</span>
                  </div>
                )
              })}
            </div>
            {order.service_cost > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Service Cost: <span className="font-semibold text-blue-600">${order.service_cost?.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Change Notice */}
      {canRequestChanges(order.status) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiMessageSquare} className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Need Changes?</span>
          </div>
          <p className="text-blue-700 text-sm mb-3">
            You can request edits or cancellation for this order since it's still in the early stages. Use the buttons above to send a request to the admin team.
          </p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Request Edit:</strong> Ask admin to modify order details</li>
            <li>• <strong>Request Cancel:</strong> Ask admin to cancel this order</li>
            <li>• All requests are reviewed by the admin team</li>
          </ul>
        </div>
      )}

      {/* Admin Request Modal */}
      {showRequestModal && (
        <AdminRequestModal
          order={order}
          requestType={requestType}
          onClose={() => {
            setShowRequestModal(false)
            setRequestType(null)
          }}
          onSubmit={handleAdminRequest}
          loading={requestLoading}
        />
      )}
    </div>
  )
}

export default OrderDetailPage