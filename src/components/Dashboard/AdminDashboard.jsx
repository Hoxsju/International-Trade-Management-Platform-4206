import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileService } from '../../services/profileService'
import { generateBuyerId, generateSupplierId } from '../../utils/idGenerator'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiShield, FiCheckCircle, FiXCircle, FiClock, FiEye, FiSettings, FiBarChart, FiEdit, FiTrash2, FiUserCheck, FiUserX, FiMail, FiPhone, FiBuilding, FiPlus, FiSend, FiUser, FiAlertTriangle, FiMessageSquare, FiCheck, FiX, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiCopy } = FiIcons

// Add Supplier Verification Modal
const SupplierVerificationModal = ({ supplier, onClose, onVerify, loading }) => {
  const [verificationAction, setVerificationAction] = useState('')
  const [message, setMessage] = useState('')

  const handleVerify = () => {
    if (!verificationAction) {
      alert('Please select a verification action')
      return
    }
    onVerify(supplier.id, verificationAction, message)
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'verified': return 'border-green-300 bg-green-50'
      case 'blacklisted': return 'border-red-300 bg-red-50'
      case 'request_details': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Supplier Verification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiXCircle} className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {/* Supplier Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Supplier Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Company:</span>
                <p className="text-gray-900">{supplier.company_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Contact:</span>
                <p className="text-gray-900">{supplier.full_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{supplier.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p className="text-gray-900">{supplier.phone || 'Not provided'}</p>
              </div>
              {supplier.chinese_company_name && (
                <div>
                  <span className="font-medium text-gray-600">Chinese Name:</span>
                  <p className="text-gray-900">{supplier.chinese_company_name}</p>
                </div>
              )}
              {supplier.business_license && (
                <div>
                  <span className="font-medium text-gray-600">Business License:</span>
                  <p className="text-gray-900">{supplier.business_license}</p>
                </div>
              )}
              {supplier.official_address && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">Address:</span>
                  <p className="text-gray-900">{supplier.official_address}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Current Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                  supplier.supplier_status === 'verified' ? 'bg-green-100 text-green-800' :
                  supplier.supplier_status === 'blacklisted' ? 'bg-red-100 text-red-800' :
                  supplier.supplier_status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {supplier.supplier_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Verification Decision</h4>
            <div className="space-y-3">
              <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${getActionColor('verified')}`}>
                <input
                  type="radio"
                  value="verified"
                  checked={verificationAction === 'verified'}
                  onChange={(e) => setVerificationAction(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Approve Supplier</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Verify and approve this supplier. They will be marked as verified and can receive orders.
                  </p>
                </div>
              </label>

              <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${getActionColor('blacklisted')}`}>
                <input
                  type="radio"
                  value="blacklisted"
                  checked={verificationAction === 'blacklisted'}
                  onChange={(e) => setVerificationAction(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiXCircle} className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Reject Supplier</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Reject and blacklist this supplier. They will not be able to receive orders.
                  </p>
                </div>
              </label>

              <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${getActionColor('request_details')}`}>
                <input
                  type="radio"
                  value="request_details"
                  checked={verificationAction === 'request_details'}
                  onChange={(e) => setVerificationAction(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Request More Details</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Request additional information or documentation from the supplier.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Message/Notes */}
          {verificationAction && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
                {verificationAction === 'verified' ? 'Approval Notes (Optional)' :
                 verificationAction === 'blacklisted' ? 'Rejection Reason' :
                 'Details to Request'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={
                  verificationAction === 'verified' ? 'Optional notes about the approval...' :
                  verificationAction === 'blacklisted' ? 'Please provide a reason for rejection...' :
                  'Specify what additional information is needed...'
                }
                required={verificationAction === 'blacklisted' || verificationAction === 'request_details'}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleVerify}
            disabled={loading || !verificationAction || ((verificationAction === 'blacklisted' || verificationAction === 'request_details') && !message.trim())}
            className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center space-x-2 ${
              verificationAction === 'verified' ? 'bg-green-600 hover:bg-green-700' :
              verificationAction === 'blacklisted' ? 'bg-red-600 hover:bg-red-700' :
              verificationAction === 'request_details' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-gray-600'
            }`}
          >
            <SafeIcon icon={
              verificationAction === 'verified' ? FiCheck :
              verificationAction === 'blacklisted' ? FiX :
              verificationAction === 'request_details' ? FiMail :
              FiClock
            } className="h-4 w-4" />
            <span>
              {loading ? 'Processing...' :
               verificationAction === 'verified' ? 'Approve Supplier' :
               verificationAction === 'blacklisted' ? 'Reject Supplier' :
               verificationAction === 'request_details' ? 'Request Details' :
               'Select Action'}
            </span>
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

// Enhanced AddUserModal with manual invitation fallback
const AddUserModal = ({ onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    account_type: 'buyer',
    password: '',
    activation_method: 'active'
  })
  
  const [showManualInvitation, setShowManualInvitation] = useState(false)
  const [manualInvitationText, setManualInvitationText] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      await onSave(formData)
    } catch (error) {
      // If email sending fails, show manual invitation option
      if (error.message.includes('Email service') || error.message.includes('temporarily unavailable')) {
        console.log('📧 Email failed, showing manual invitation option')
        
        const invitationData = {
          email: formData.email,
          name: formData.full_name,
          company: formData.company_name,
          accountType: formData.account_type,
          invitedBy: 'Admin'
        }
        
        const manualText = EmailService.createManualInvitationText(invitationData)
        setManualInvitationText(manualText)
        setShowManualInvitation(true)
      } else {
        throw error
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualInvitationText)
    alert('Invitation text copied to clipboard!')
  }

  const isFormValid = formData.full_name && formData.email && formData.company_name && 
    (formData.activation_method === 'invitation' || formData.password)

  if (showManualInvitation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Manual Invitation - Email Service Unavailable</h3>
            <button onClick={() => { setShowManualInvitation(false); onClose(); }} className="text-gray-400 hover:text-gray-600">
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
                The automated email invitation system is currently experiencing issues. 
                Please copy the invitation text below and send it manually to the user.
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
                value={manualInvitationText}
                readOnly
                rows={15}
                className="w-full p-3 border border-gray-300 rounded font-mono text-sm bg-white"
              />
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-blue-800 text-sm space-y-1">
                <li>1. Click "Copy" to copy the invitation text</li>
                <li>2. Send this text to: <strong>{formData.email}</strong></li>
                <li>3. You can send it via email, messaging app, or any communication method</li>
                <li>4. The user will receive the registration link and instructions</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <SafeIcon icon={FiCopy} className="h-4 w-4" />
              <span>Copy Invitation</span>
            </button>
            <button
              onClick={() => { setShowManualInvitation(false); onClose(); }}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiXCircle} className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => handleInputChange('account_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Activation Method</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="active"
                  checked={formData.activation_method === 'active'}
                  onChange={(e) => handleInputChange('activation_method', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Create Active Account</div>
                  <div className="text-sm text-gray-500">Account is immediately active and confirmed</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="invitation"
                  checked={formData.activation_method === 'invitation'}
                  onChange={(e) => handleInputChange('activation_method', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Send Invitation</div>
                  <div className="text-sm text-gray-500">Email invitation to complete registration</div>
                </div>
              </label>
            </div>
          </div>

          {formData.activation_method === 'active' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password (min 6 characters)"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
            </div>
          )}

          {/* Email Service Warning */}
          {formData.activation_method === 'invitation' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <SafeIcon icon={FiAlertTriangle} className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Email Service Status</span>
              </div>
              <p className="text-xs text-yellow-700">
                If email sending fails, you'll be provided with manual invitation text to copy and send.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={formData.activation_method === 'active' ? FiUserCheck : FiSend} className="h-4 w-4" />
            <span>
              {loading ? 'Processing...' :
               formData.activation_method === 'active' ? 'Create Active User' : 'Send Invitation'}
            </span>
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

// Move UserModal outside as well
const UserModal = ({ user, onClose, onEdit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <SafeIcon icon={FiXCircle} className="h-6 w-6" />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{user.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiMail} className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiPhone} className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-gray-900 font-mono text-sm">{user.user_id}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Company Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiBuilding} className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-900">{user.company_name}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Type</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.account_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.account_type === 'buyer' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.account_type}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {user.account_type === 'supplier' && (
          <div className="mt-6 border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Supplier Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Chinese Company Name</label>
                <p className="text-gray-900">{user.chinese_company_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Business License</label>
                <p className="text-gray-900">{user.business_license || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Official Address</label>
                <p className="text-gray-900">{user.official_address || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.supplier_status === 'verified' ? 'bg-green-100 text-green-800' :
                  user.supplier_status === 'blacklisted' ? 'bg-red-100 text-red-800' :
                  user.supplier_status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.supplier_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
        <button
          onClick={() => onEdit(user)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit User
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)

// Move EditModal outside as well
const EditModal = ({ user, onClose, onSave, loading }) => {
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    status: user?.status || 'active'
  })

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSave({ ...user, ...editData })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiXCircle} className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={editData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={editData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={editData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
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

// FIXED: Collapsible Filter Component for Users
const CollapsibleUserFilter = ({
  searchTerm, setSearchTerm,
  filterAccountType, setFilterAccountType,
  filterStatus, setFilterStatus,
  filterSupplierStatus, setFilterSupplierStatus,
  clearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasActiveFilters = searchTerm || filterAccountType !== 'all' || filterStatus !== 'all' || filterSupplierStatus !== 'all'

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {[
                  searchTerm ? 1 : 0,
                  filterAccountType !== 'all' ? 1 : 0,
                  filterStatus !== 'all' ? 1 : 0,
                  filterSupplierStatus !== 'all' ? 1 : 0
                ].reduce((a, b) => a + b, 0)} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <span className="text-sm">Filters</span>
              <SafeIcon icon={isExpanded ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Filter Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiSearch} className="inline h-4 w-4 mr-1" />
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, company, or user ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Account Type Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="admin">Admin</option>
                <option value="buyer">Buyer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Supplier Status Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Status</label>
              <select
                value={filterSupplierStatus}
                onChange={(e) => setFilterSupplierStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Supplier Status</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="blacklisted">Blacklisted</option>
                <option value="request_details">Request Details</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterAccountType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Type: {filterAccountType}
                  <button
                    onClick={() => setFilterAccountType('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterSupplierStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Supplier: {filterSupplierStatus.replace('_', ' ')}
                  <button
                    onClick={() => setFilterSupplierStatus('all')}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// FIXED: Collapsible Filter Component for Orders
const CollapsibleOrderFilter = ({
  searchTerm, setSearchTerm,
  filterStatus, setFilterStatus,
  filterDateRange, setFilterDateRange,
  clearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterDateRange !== 'all'

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Order Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {[
                  searchTerm ? 1 : 0,
                  filterStatus !== 'all' ? 1 : 0,
                  filterDateRange !== 'all' ? 1 : 0
                ].reduce((a, b) => a + b, 0)} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <span className="text-sm">Filters</span>
              <SafeIcon icon={isExpanded ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Filter Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiSearch} className="inline h-4 w-4 mr-1" />
                Search Orders
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, buyer, supplier..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Status: {filterStatus.replace('_', ' ')}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterDateRange !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Date: {filterDateRange}
                  <button
                    onClick={() => setFilterDateRange('all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AdminDashboard = ({ userProfile }) => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingSuppliers, setPendingSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [allUsers, setAllUsers] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showSupplierVerificationModal, setShowSupplierVerificationModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [supplierVerificationLoading, setSupplierVerificationLoading] = useState(false)

  // User Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAccountType, setFilterAccountType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSupplierStatus, setFilterSupplierStatus] = useState('all')

  // Order Search and Filter State
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')
  const [orderFilterDateRange, setOrderFilterDateRange] = useState('all')

  useEffect(() => {
    if (userProfile) {
      fetchAdminData()
    }
  }, [userProfile])

  // Scroll to top when changing views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  const fetchAdminData = async () => {
    try {
      // Fetch user stats
      const { data: usersData } = await supabase
        .from('user_profiles_rg2024')
        .select('*')

      // Fetch order stats
      const { data: ordersData } = await supabase
        .from('trade_orders_rg2024')
        .select('*')

      // Fetch pending suppliers
      const { data: suppliersData } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('account_type', 'supplier')
        .eq('supplier_status', 'pending_verification')
        .limit(5)

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from('trade_orders_rg2024')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.deal_amount || 0), 0) || 0

      setStats({
        totalUsers: usersData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        pendingVerifications: suppliersData?.length || 0
      })

      setRecentOrders(recentOrdersData || [])
      setPendingSuppliers(suppliersData || [])
      setAllUsers(usersData || [])
      setAllOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search users
  const filteredUsers = allUsers.filter(user => {
    // Search term filter
    const matchesSearch = searchTerm === '' ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())

    // Account type filter
    const matchesAccountType = filterAccountType === 'all' || user.account_type === filterAccountType

    // Status filter
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus

    // Supplier status filter (only for suppliers)
    const matchesSupplierStatus = filterSupplierStatus === 'all' ||
      (user.account_type === 'supplier' && user.supplier_status === filterSupplierStatus)

    return matchesSearch && matchesAccountType && matchesStatus && matchesSupplierStatus
  })

  // Filter and search orders
  const filteredOrders = allOrders.filter(order => {
    // Search term filter
    const matchesSearch = orderSearchTerm === '' ||
      order.order_id?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.buyer_company?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(orderSearchTerm.toLowerCase())

    // Status filter
    const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus

    // Date range filter
    let matchesDateRange = true
    if (orderFilterDateRange !== 'all') {
      const orderDate = new Date(order.created_at)
      const now = new Date()

      switch (orderFilterDateRange) {
        case 'today':
          matchesDateRange = orderDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = orderDate >= weekAgo
          break
        case 'month':
          matchesDateRange = orderDate.getMonth() === now.getMonth() && 
                            orderDate.getFullYear() === now.getFullYear()
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          const orderQuarter = Math.floor(orderDate.getMonth() / 3)
          matchesDateRange = orderQuarter === quarter && 
                            orderDate.getFullYear() === now.getFullYear()
          break
        case 'year':
          matchesDateRange = orderDate.getFullYear() === now.getFullYear()
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const handleSupplierVerification = async (supplierId, status, message = '') => {
    setSupplierVerificationLoading(true)
    try {
      console.log('🔧 Updating supplier verification status:', { supplierId, status, message })

      // FIXED: Only update existing columns in the database
      const updateData = {
        supplier_status: status,
        updated_at: new Date().toISOString()
      }

      console.log('📝 Update data (fixed - no verification_notes):', updateData)

      const { error } = await supabase
        .from('user_profiles_rg2024')
        .update(updateData)
        .eq('id', supplierId)

      if (error) {
        console.error('❌ Database update error:', error)
        throw error
      }

      console.log('✅ Supplier status updated successfully')

      // Send email notification to supplier
      try {
        const supplier = allUsers.find(u => u.id === supplierId)
        if (supplier && message.trim()) {
          console.log('📧 Sending notification email to:', supplier.email)

          let emailSubject, emailMessage

          if (status === 'verified') {
            emailSubject = 'Supplier Verification Approved - Regravity'
            emailMessage = `Dear ${supplier.full_name},

Congratulations! Your supplier account has been approved by our verification team.

Company: ${supplier.company_name}
Status: Verified Supplier

You can now receive orders from buyers on the Regravity platform. Your verified status will be displayed to potential buyers, giving them confidence in doing business with you.

${message ? `Admin Notes: ${message}` : ''}

Next Steps:
• Complete your supplier profile if you haven't already
• Review our supplier guidelines
• Start connecting with international buyers

If you have any questions, please contact our support team.

Best regards,
Regravity Verification Team
support@regravity.net`
          } else if (status === 'blacklisted') {
            emailSubject = 'Supplier Verification Status - Regravity'
            emailMessage = `Dear ${supplier.full_name},

We have completed the review of your supplier verification application for ${supplier.company_name}.

Unfortunately, we are unable to approve your supplier status at this time.

Reason: ${message}

If you believe this decision was made in error, or if you have additional information that might change our assessment, please contact our support team at support@regravity.net.

Thank you for your interest in the Regravity platform.

Best regards,
Regravity Verification Team`
          } else if (status === 'request_details') {
            emailSubject = 'Additional Information Required - Supplier Verification'
            emailMessage = `Dear ${supplier.full_name},

Thank you for your supplier verification application for ${supplier.company_name}.

To complete your verification process, we need additional information:

${message}

Please provide the requested information by replying to this email or contacting our support team at support@regravity.net.

Once we receive the additional information, we will complete your verification review within 2-3 business days.

Thank you for your cooperation.

Best regards,
Regravity Verification Team`
          }

          await EmailService.sendContactForm({
            fullName: 'Regravity Verification Team',
            email: supplier.email,
            subject: emailSubject,
            message: emailMessage
          })

          console.log('✅ Email notification sent successfully')
        }
      } catch (emailError) {
        console.warn('⚠️ Failed to send notification email:', emailError)
        // Don't fail the entire operation if email fails
      }

      // Close modal and refresh data
      setShowSupplierVerificationModal(false)
      setSelectedSupplier(null)
      await fetchAdminData()

      // Show success message
      const actionText = status === 'verified' ? 'approved' :
                         status === 'blacklisted' ? 'rejected' :
                         'updated with request for more details'
      alert(`✅ Supplier verification ${actionText} successfully!`)

    } catch (error) {
      console.error('💥 Error updating supplier status:', error)
      alert(`❌ Error updating supplier: ${error.message}`)
    } finally {
      setSupplierVerificationLoading(false)
    }
  }

  const handleSupplierVerificationFromTable = (supplier) => {
    setSelectedSupplier(supplier)
    setShowSupplierVerificationModal(true)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleSaveUser = async (userData) => {
    setEditUserLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles_rg2024')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          company_name: userData.company_name,
          status: userData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)

      if (error) throw error

      setShowEditModal(false)
      setEditingUser(null)
      fetchAdminData()
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Error updating user: ${error.message}`)
    } finally {
      setEditUserLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      const { error } = await supabase
        .from('user_profiles_rg2024')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      fetchAdminData()
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  // FIXED: Enhanced handleAddUser function with better error handling and validation
  const handleAddUser = async (formData) => {
    setAddUserLoading(true)
    try {
      console.log('🔧 FIXED: Admin creating user...', formData.email)

      // FIXED: Validate form data before proceeding
      if (!formData.full_name || !formData.email || !formData.company_name) {
        throw new Error('Please fill in all required fields (Name, Email, Company)')
      }

      if (formData.activation_method === 'active' && !formData.password) {
        throw new Error('Password is required for active accounts')
      }

      const userId = formData.account_type === 'buyer' ? generateBuyerId() : generateSupplierId()

      if (formData.activation_method === 'active') {
        console.log('🔧 FIXED: Creating active user account with session preservation...')

        // SOLUTION: Store admin session data before creating new user
        const { data: { session: currentAdminSession } } = await supabase.auth.getSession()
        console.log('💾 FIXED: Storing current admin session:', currentAdminSession?.user?.email)

        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: null, // Disable email confirmation
            data: {
              full_name: formData.full_name,
              account_type: formData.account_type,
              user_id: userId
            }
          }
        })

        if (authError) {
          console.error('❌ FIXED: Auth user creation failed:', authError)
          throw new Error(`Authentication failed: ${authError.message}`)
        }

        if (!authData?.user?.id) {
          throw new Error('No user ID returned from authentication')
        }

        console.log('✅ FIXED: Auth user created:', authData.user.id)

        // Create profile with comprehensive data
        const profileData = {
          id: authData.user.id,
          user_id: userId,
          email: formData.email.toLowerCase(),
          full_name: formData.full_name,
          phone: formData.phone || '',
          company_name: formData.company_name,
          account_type: formData.account_type,
          status: 'active',
          email_verified: true,
          verification_method: 'admin_created',
          supplier_status: formData.account_type === 'supplier' ? 'pending_verification' : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('🔧 FIXED: Creating profile with data:', profileData)

        // Use ProfileService to create profile
        const profileResult = await ProfileService.createUserProfile(profileData)

        if (profileResult.error) {
          console.error('❌ FIXED: Profile creation failed:', profileResult.error)
          throw new Error(`Profile creation failed: ${profileResult.error.message}`)
        }

        console.log('✅ FIXED: Profile created successfully:', profileResult.data)

        // CRITICAL: Restore admin session immediately
        if (currentAdminSession?.access_token) {
          console.log('🔄 FIXED: Restoring admin session...')

          // Method 1: Set session directly
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: currentAdminSession.access_token,
            refresh_token: currentAdminSession.refresh_token
          })

          if (sessionError) {
            console.warn('⚠️ FIXED: Session restore failed, trying alternative method:', sessionError)

            // Method 2: Force refresh current session
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              console.warn('⚠️ FIXED: Session refresh failed:', refreshError)
            }
          } else {
            console.log('✅ FIXED: Session restored successfully')
          }
        }

        console.log('🎉 FIXED: User creation completed successfully with session preserved')

      } else {
        // FIXED: Send invitation email with enhanced error handling
        console.log('🔧 FIXED: Sending invitation email...')
        try {
          // FIXED: Test EmailJS service first
          console.log('🧪 FIXED: Testing EmailJS service before sending invitation...')
          await EmailService.testEmailService()
          console.log('✅ FIXED: EmailJS service test passed')

          // FIXED: Send invitation with better data validation
          console.log('📧 FIXED: Sending admin user invitation with validated data...')
          const result = await EmailService.sendAdminUserInvitation(
            formData,
            userProfile?.full_name || 'Admin'
          )
          console.log('✅ FIXED: Invitation email sent successfully:', result)

        } catch (emailError) {
          console.error('❌ FIXED: Invitation email failed:', emailError)

          // FIXED: Provide more specific error messages
          if (emailError.message.includes('EmailJS')) {
            throw new Error('Email service is currently unavailable. Please try again later or create an active account instead.')
          } else if (emailError.message.includes('template')) {
            throw new Error('Email template configuration error. Please contact system administrator.')
          } else if (emailError.message.includes('network') || emailError.message.includes('fetch')) {
            throw new Error('Network error while sending invitation. Please check your internet connection and try again.')
          } else {
            throw new Error(`Failed to send user invitation: ${emailError.message}`)
          }
        }
      }

      // Close modal and refresh data
      setShowAddUserModal(false)
      await fetchAdminData()

      // Show success message
      const successMessage = formData.activation_method === 'active'
        ? `✅ User account created successfully! ${formData.full_name} can now log in with their credentials.`
        : `✅ Invitation sent successfully! ${formData.full_name} will receive an email with registration instructions.`

      alert(successMessage)

    } catch (error) {
      console.error('💥 FIXED: User creation failed:', error)

      // FIXED: Enhanced error messages with user-friendly descriptions
      let userFriendlyMessage = 'Failed to create user account.'

      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        userFriendlyMessage = `Email ${formData.email} is already registered. Please use a different email address.`
      } else if (error.message.includes('invalid email')) {
        userFriendlyMessage = `Invalid email format: ${formData.email}. Please enter a valid email address.`
      } else if (error.message.includes('weak password')) {
        userFriendlyMessage = 'Password is too weak. Please use a stronger password with at least 6 characters.'
      } else if (error.message.includes('User not allowed')) {
        userFriendlyMessage = 'Unable to create user account. Please try a different email or contact support.'
      } else if (error.message.includes('Email service')) {
        userFriendlyMessage = 'Email service is temporarily unavailable. You can create an active account instead, or try again later.'
      } else if (error.message.includes('required fields')) {
        userFriendlyMessage = error.message
      } else if (error.message.includes('Password is required')) {
        userFriendlyMessage = error.message
      } else {
        userFriendlyMessage = `Error: ${error.message}`
      }

      alert(`❌ ${userFriendlyMessage}`)
    } finally {
      setAddUserLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSupplierStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'blacklisted': return 'bg-red-100 text-red-800'
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800'
      case 'request_details': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleQuickAction = (action) => {
    setActiveView(action)
  }

  // Clear all filters for users
  const clearUserFilters = () => {
    setSearchTerm('')
    setFilterAccountType('all')
    setFilterStatus('all')
    setFilterSupplierStatus('all')
  }

  // Clear all filters for orders
  const clearOrderFilters = () => {
    setOrderSearchTerm('')
    setOrderFilterStatus('all')
    setOrderFilterDateRange('all')
  }

  // FIXED: Quick Actions Component
  const QuickActionsBox = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleQuickAction('users')}
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors hover:border-blue-300 hover:shadow-md"
        >
          <SafeIcon icon={FiUsers} className="h-6 w-6 text-gray-600 mx-auto mb-2 group-hover:text-blue-600" />
          <span className="text-sm text-gray-700">Manage Users</span>
        </button>
        <button
          onClick={() => handleQuickAction('orders')}
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors hover:border-green-300 hover:shadow-md"
        >
          <SafeIcon icon={FiPackage} className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">View Orders</span>
        </button>
        <button
          onClick={() => handleQuickAction('analytics')}
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors hover:border-purple-300 hover:shadow-md"
        >
          <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">Analytics</span>
        </button>
        <button
          onClick={() => handleQuickAction('security')}
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center transition-colors hover:border-red-300 hover:shadow-md"
        >
          <SafeIcon icon={FiShield} className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">Security</span>
        </button>
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* FIXED: Quick Actions at Top */}
      <QuickActionsBox />

      {/* FIXED: Collapsible Filter Section */}
      <CollapsibleUserFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterAccountType={filterAccountType}
        setFilterAccountType={setFilterAccountType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterSupplierStatus={filterSupplierStatus}
        setFilterSupplierStatus={setFilterSupplierStatus}
        clearFilters={clearUserFilters}
      />

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length} of {allUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <SafeIcon icon={FiUsers} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found matching your criteria</p>
                    <button
                      onClick={clearUserFilters}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Clear filters to see all users
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.account_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.account_type === 'buyer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.account_type}
                      </span>
                      {user.account_type === 'supplier' && (
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSupplierStatusColor(user.supplier_status)}`}>
                            {user.supplier_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <SafeIcon icon={FiEye} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                          title="Edit User"
                        >
                          <SafeIcon icon={FiEdit} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`p-1 rounded ${
                            user.status === 'active' 
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          <SafeIcon icon={user.status === 'active' ? FiUserX : FiUserCheck} className="h-4 w-4" />
                        </button>
                        {/* Add Supplier Verification Button */}
                        {user.account_type === 'supplier' && (
                          <button
                            onClick={() => handleSupplierVerificationFromTable(user)}
                            className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded"
                            title="Supplier Verification"
                          >
                            <SafeIcon icon={FiShield} className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={handleAddUser}
          loading={addUserLoading}
        />
      )}

      {showUserModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onEdit={handleEditUser}
        />
      )}

      {showEditModal && editingUser && (
        <EditModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
          onSave={handleSaveUser}
          loading={editUserLoading}
        />
      )}

      {showSupplierVerificationModal && selectedSupplier && (
        <SupplierVerificationModal
          supplier={selectedSupplier}
          onClose={() => {
            setShowSupplierVerificationModal(false)
            setSelectedSupplier(null)
          }}
          onVerify={handleSupplierVerification}
          loading={supplierVerificationLoading}
        />
      )}
    </div>
  )

  const renderOrderManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <button
          onClick={() => setActiveView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* FIXED: Quick Actions at Top */}
      <QuickActionsBox />

      {/* FIXED: Collapsible Order Filter Section */}
      <CollapsibleOrderFilter
        searchTerm={orderSearchTerm}
        setSearchTerm={setOrderSearchTerm}
        filterStatus={orderFilterStatus}
        setFilterStatus={setOrderFilterStatus}
        filterDateRange={orderFilterDateRange}
        setFilterDateRange={setOrderFilterDateRange}
        clearFilters={clearOrderFilters}
      />

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length} of {allOrders.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <SafeIcon icon={FiPackage} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found matching your criteria</p>
                    <button
                      onClick={clearOrderFilters}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Clear filters to see all orders
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.buyer_company}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.supplier_name || 'Pending'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${order.deal_amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <button
          onClick={() => setActiveView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Growth</h3>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Growth</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Volume</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Items</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingVerifications}</p>
          <p className="text-sm text-gray-600">Need Attention</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">User Satisfaction</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <span className="text-green-600 font-medium">92%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Order Success Rate</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
            <span className="text-blue-600 font-medium">88%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Platform Uptime</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
            </div>
            <span className="text-green-600 font-medium">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security & Settings</h2>
        <button
          onClick={() => setActiveView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Security</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">SSL Certificate</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Database Encryption</span>
              <span className="text-green-600 font-medium">✓ Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Backup Status</span>
              <span className="text-green-600 font-medium">✓ Daily</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Firewall</span>
              <span className="text-green-600 font-medium">✓ Protected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Security</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Two-Factor Auth</span>
              <span className="text-blue-600 font-medium">Recommended</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Email Verification</span>
              <span className="text-green-600 font-medium">✓ Required</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Password Policy</span>
              <span className="text-green-600 font-medium">✓ Strong</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Session Timeout</span>
              <span className="text-gray-600 font-medium">24 hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Admin Login</p>
              <p className="text-xs text-gray-500">Successful login from {user.email}</p>
            </div>
            <span className="text-xs text-gray-500">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Database Backup</p>
              <p className="text-xs text-gray-500">Automated backup completed successfully</p>
            </div>
            <span className="text-xs text-gray-500">Today 03:00 AM</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">System Update</p>
              <p className="text-xs text-gray-500">Security patches applied</p>
            </div>
            <span className="text-xs text-gray-500">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Render different views based on activeView state
  switch (activeView) {
    case 'users':
      return renderUserManagement()
    case 'orders':
      return renderOrderManagement()
    case 'analytics':
      return renderAnalytics()
    case 'security':
      return renderSecurity()
    default:
      // Default dashboard view
      return (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userProfile?.full_name}!</p>
            <p className="text-sm text-gray-500">Manage users, orders, and platform operations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <SafeIcon icon={FiUsers} className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <SafeIcon icon={FiPackage} className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <SafeIcon icon={FiDollarSign} className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingVerifications}</p>
                </div>
                <SafeIcon icon={FiShield} className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.order_id}</p>
                          <p className="text-sm text-gray-600">{order.buyer_company}</p>
                          <p className="text-sm text-gray-500">${order.deal_amount?.toLocaleString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Supplier Verifications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Pending Supplier Verifications</h2>
              </div>
              <div className="p-6">
                {pendingSuppliers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending verifications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSuppliers.map((supplier) => (
                      <div key={supplier.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{supplier.company_name}</p>
                            <p className="text-sm text-gray-600">{supplier.full_name}</p>
                            <p className="text-sm text-gray-500">{supplier.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSupplierVerification(supplier.id, 'verified')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <SafeIcon icon={FiCheckCircle} className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleSupplierVerification(supplier.id, 'blacklisted')}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <SafeIcon icon={FiXCircle} className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActionsBox />
        </div>
      )
  }
}

export default AdminDashboard