import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { generateOrderId } from '../../utils/idGenerator'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUpload, FiDollarSign, FiUser, FiMail, FiPhone, FiMessageSquare, FiCheckSquare, FiSquare, FiSearch } = FiIcons

const CreateOrderForm = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [selectedServices, setSelectedServices] = useState({})
  const [totalServiceCost, setTotalServiceCost] = useState(0)

  const services = [
    { id: 'verification', name: 'Supplier Business Verification', cost: 50 },
    { id: 'inspection', name: 'On-site Quality Inspection', cost: 350 },
    { id: 'testing', name: 'Laboratory Testing', cost: 0, note: 'Price added after admin review' },
    { id: 'shipping', name: 'Shipping Coordination', cost: 0, note: 'Quotation provided after packaging list' },
    { id: 'certificates', name: 'Certificate Request (CE, SGS, etc.)', cost: 0, note: 'Price added later' }
  ]

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    const total = Object.entries(selectedServices)
      .filter(([_, selected]) => selected)
      .reduce((sum, [serviceId]) => {
        const service = services.find(s => s.id === serviceId)
        return sum + (service?.cost || 0)
      }, 0)
    setTotalServiceCost(total)
  }, [selectedServices])

  // Filter suppliers based on search
  useEffect(() => {
    if (supplierSearch) {
      const filtered = suppliers.filter(supplier =>
        supplier.company_name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        (supplier.chinese_company_name && supplier.chinese_company_name.toLowerCase().includes(supplierSearch.toLowerCase()))
      )
      setFilteredSuppliers(filtered)
    } else {
      setFilteredSuppliers(suppliers)
    }
  }, [supplierSearch, suppliers])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_rg2024')
        .select('id, company_name, chinese_company_name, user_id')
        .eq('account_type', 'supplier')
        .eq('status', 'active')

      if (error) throw error
      setSuppliers(data || [])
      setFilteredSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  const handleSupplierSelect = (supplier) => {
    setValue('existingSupplier', supplier.id)
    setSupplierSearch(`${supplier.company_name}${supplier.chinese_company_name ? ` (${supplier.chinese_company_name})` : ''}`)
    setShowSupplierDropdown(false)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      console.log('🔄 Creating order with data:', data)
      
      const orderId = generateOrderId()

      // Get buyer profile
      const { data: buyerProfile, error: buyerError } = await supabase
        .from('user_profiles_rg2024')
        .select('*')
        .eq('id', user.id)
        .single()

      if (buyerError) {
        console.error('❌ Buyer profile fetch error:', buyerError)
        throw new Error(`Failed to fetch buyer profile: ${buyerError.message}`)
      }

      console.log('✅ Buyer profile loaded:', buyerProfile)

      const orderData = {
        order_id: orderId,
        buyer_id: user.id,
        buyer_company: buyerProfile.company_name,
        product_description: data.productDescription,
        deal_amount: parseFloat(data.dealAmount),
        supplier_bank_account: data.supplierBankAccount,
        selected_services: selectedServices,
        service_cost: totalServiceCost,
        total_amount: parseFloat(data.dealAmount) + totalServiceCost,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (data.supplierType === 'existing') {
        const selectedSupplier = suppliers.find(s => s.id === data.existingSupplier)
        if (!selectedSupplier) {
          throw new Error('Please select a valid supplier')
        }
        orderData.supplier_id = selectedSupplier.id
        orderData.supplier_name = selectedSupplier.company_name
        console.log('✅ Using existing supplier:', selectedSupplier.company_name)
      } else {
        // New supplier
        if (!data.newSupplierName || !data.newSupplierEmail) {
          throw new Error('Please provide supplier name and email for new supplier')
        }
        orderData.supplier_name = data.newSupplierName
        orderData.supplier_email = data.newSupplierEmail
        orderData.supplier_phone = data.newSupplierPhone
        orderData.supplier_wechat = data.newSupplierWechat
        orderData.status = 'pending_supplier_registration'
        console.log('✅ Using new supplier:', data.newSupplierName)
      }

      console.log('📝 Final order data:', orderData)

      const { data: insertedOrder, error: insertError } = await supabase
        .from('trade_orders_rg2024')
        .insert([orderData])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Order insertion error:', insertError)
        throw new Error(`Failed to create order: ${insertError.message}`)
      }

      console.log('✅ Order created successfully:', insertedOrder)

      // Send email notifications
      try {
        console.log('📧 Sending email notifications...')
        
        // Send order notification to admin
        await EmailService.sendOrderNotification({
          ...orderData,
          buyer_name: buyerProfile.full_name,
          buyer_email: buyerProfile.email
        })

        // Send supplier invitation if new supplier
        if (data.supplierType === 'new') {
          await EmailService.sendSupplierInvite({
            name: data.newSupplierName,
            email: data.newSupplierEmail
          }, orderData)
        }
        
        console.log('✅ Email notifications sent')
      } catch (emailError) {
        console.warn('⚠️ Email notification failed:', emailError)
        // Don't fail the order creation if email fails
      }

      alert('✅ Order created successfully!')
      
      // Navigate back to dashboard and scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/dashboard')
    } catch (error) {
      console.error('💥 Error creating order:', error)
      alert(`❌ Error creating order: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const supplierType = watch('supplierType')

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Trade Order</h2>
        <p className="text-gray-600 mt-2">Submit a new purchase request with supplier details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Supplier Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Supplier Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="existing"
                    {...register('supplierType', { required: 'Please select supplier type' })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Existing Supplier</div>
                    <div className="text-sm text-gray-500">Choose from registered suppliers</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="new"
                    {...register('supplierType', { required: 'Please select supplier type' })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">New Supplier</div>
                    <div className="text-sm text-gray-500">Add supplier details</div>
                  </div>
                </label>
              </div>
              {errors.supplierType && <p className="text-red-500 text-sm mt-1">{errors.supplierType.message}</p>}
            </div>

            {supplierType === 'existing' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiSearch} className="inline h-4 w-4 mr-1" />
                  Search and Select Supplier
                </label>
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value)
                    setShowSupplierDropdown(true)
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type supplier name to search..."
                />
                
                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuppliers.map(supplier => (
                      <div
                        key={supplier.id}
                        onClick={() => handleSupplierSelect(supplier)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{supplier.company_name}</div>
                        {supplier.chinese_company_name && (
                          <div className="text-sm text-gray-500">{supplier.chinese_company_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <input
                  type="hidden"
                  {...register('existingSupplier', { 
                    required: supplierType === 'existing' ? 'Please select a supplier' : false 
                  })}
                />
                {errors.existingSupplier && <p className="text-red-500 text-sm mt-1">{errors.existingSupplier.message}</p>}
              </div>
            )}

            {supplierType === 'new' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" />
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    {...register('newSupplierName', { 
                      required: supplierType === 'new' ? 'Supplier name is required' : false 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.newSupplierName && <p className="text-red-500 text-sm mt-1">{errors.newSupplierName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('newSupplierEmail', { 
                      required: supplierType === 'new' ? 'Email is required' : false 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.newSupplierEmail && <p className="text-red-500 text-sm mt-1">{errors.newSupplierEmail.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiPhone} className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('newSupplierPhone', { 
                      required: supplierType === 'new' ? 'Phone number is required' : false 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.newSupplierPhone && <p className="text-red-500 text-sm mt-1">{errors.newSupplierPhone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
                    WeChat ID (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('newSupplierWechat')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> We will send an invitation to the supplier to register on our platform. Your order will be marked as "Pending Supplier Registration" until they complete the process.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
              <textarea
                {...register('productDescription', { required: 'Product description is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the product, specifications, quantity, etc."
              />
              {errors.productDescription && <p className="text-red-500 text-sm mt-1">{errors.productDescription.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiDollarSign} className="inline h-4 w-4 mr-1" />
                  Deal Amount (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('dealAmount', { 
                    required: 'Deal amount is required',
                    min: { value: 1, message: 'Amount must be at least $1' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.dealAmount && <p className="text-red-500 text-sm mt-1">{errors.dealAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Quotation</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  {...register('quotationFile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, or image files only</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Bank Account</label>
              <textarea
                {...register('supplierBankAccount', { required: 'Supplier bank account is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Bank name, account number, SWIFT code, etc."
              />
              {errors.supplierBankAccount && <p className="text-red-500 text-sm mt-1">{errors.supplierBankAccount.message}</p>}
            </div>
          </div>
        </div>

        {/* Optional Services */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optional Services</h3>
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <button
                  type="button"
                  onClick={() => handleServiceToggle(service.id)}
                  className="mt-1 text-primary-600 hover:text-primary-700"
                >
                  <SafeIcon icon={selectedServices[service.id] ? FiCheckSquare : FiSquare} className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <span className="text-sm font-medium text-gray-900">
                      {service.cost > 0 ? `$${service.cost}` : 'TBD'}
                    </span>
                  </div>
                  {service.note && (
                    <p className="text-sm text-gray-500 mt-1">{service.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* TBD Explanation */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> "TBD" (To Be Determined) means the price will be quoted later based on specific requirements. 
              These costs will be added to your order total once confirmed and will update your final invoice.
            </p>
          </div>

          {totalServiceCost > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-900">Total Service Cost:</span>
                <span className="text-lg font-bold text-green-900">${totalServiceCost}</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              navigate('/dashboard')
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateOrderForm