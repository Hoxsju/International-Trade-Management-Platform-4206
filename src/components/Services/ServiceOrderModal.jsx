import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { generateOrderId } from '../../utils/idGenerator'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiUpload, FiCheckCircle, FiAlertCircle, FiBuilding, FiGlobe, FiFileText, FiMapPin, FiUser, FiMail, FiPhone, FiDollarSign } = FiIcons

const ServiceOrderModal = ({ service, onClose, userProfile }) => {
  const { user } = useAuth()
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [filteredSuppliers, setFilteredSuppliers] = useState([])

  const serviceType = watch('serviceType') || service.id
  const supplierSelectionType = watch('supplierSelectionType')

  // Scroll to top when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [])

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

  const handleSupplierSelect = (supplier) => {
    setValue('existingSupplier', supplier.id)
    setSupplierSearch(`${supplier.company_name}${supplier.chinese_company_name ? ` (${supplier.chinese_company_name})` : ''}`)
    setShowSupplierDropdown(false)
  }

  const getServiceDetails = (serviceId) => {
    const services = {
      verification: {
        name: 'Supplier Business Verification',
        cost: 50,
        description: 'Comprehensive verification of supplier business credentials and legitimacy'
      },
      inspection: {
        name: 'On-site Quality Inspection',
        cost: 350,
        description: 'Professional on-site inspection of products before shipment'
      },
      testing: {
        name: 'Laboratory Testing',
        cost: 0,
        description: 'Professional laboratory testing for product safety and compliance',
        note: 'Quote provided based on testing requirements'
      },
      shipping: {
        name: 'Shipping Coordination',
        cost: 0,
        description: 'End-to-end shipping coordination and logistics management',
        note: 'Quote provided based on shipment details'
      },
      certificates: {
        name: 'Certificate Request (CE, SGS, etc.)',
        cost: 0,
        description: 'Assistance with obtaining necessary certificates and compliance documentation',
        note: 'Quote provided based on certificate requirements'
      }
    }
    return services[serviceId] || services.verification
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      console.log('🔄 Creating service order with data:', data)

      const serviceOrderId = generateOrderId()
      const serviceDetails = getServiceDetails(serviceType)

      // Prepare service order data
      const serviceOrderData = {
        service_order_id: serviceOrderId,
        buyer_id: user.id,
        buyer_company: userProfile.company_name,
        buyer_email: userProfile.email,
        buyer_name: userProfile.full_name,
        service_type: serviceType,
        service_name: serviceDetails.name,
        service_cost: serviceDetails.cost,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add supplier information based on selection type
      if (supplierSelectionType === 'existing') {
        const selectedSupplier = suppliers.find(s => s.id === data.existingSupplier)
        if (selectedSupplier) {
          serviceOrderData.supplier_id = selectedSupplier.id
          serviceOrderData.supplier_name = selectedSupplier.company_name
        }
      } else if (supplierSelectionType === 'new') {
        serviceOrderData.supplier_name = data.newSupplierName
        serviceOrderData.supplier_email = data.newSupplierEmail
        serviceOrderData.supplier_phone = data.newSupplierPhone
      }

      // Add service-specific data
      if (serviceType === 'verification') {
        serviceOrderData.service_details = {
          company_name_english: data.companyNameEnglish,
          company_name_chinese: data.companyNameChinese || null,
          registration_number: data.registrationNumber,
          business_license_copy: data.businessLicenseCopy || null,
          website_or_link: data.websiteOrLink || null,
          additional_info: data.additionalInfo || null
        }
      } else if (serviceType === 'inspection') {
        serviceOrderData.service_details = {
          supplier_name: data.qcSupplierName,
          supplier_contact: data.qcSupplierContact,
          supplier_email: data.qcSupplierEmail || null,
          supplier_phone: data.qcSupplierPhone || null,
          supplier_address: data.qcSupplierAddress || null,
          pi_file: data.piFile || null,
          inspection_requirements: data.inspectionRequirements || null,
          product_description: data.productDescription || null
        }
      } else {
        serviceOrderData.service_details = {
          requirements: data.serviceRequirements || null,
          additional_info: data.additionalInfo || null
        }
      }

      console.log('📝 Final service order data:', serviceOrderData)

      // Insert into service orders table
      const { data: insertedOrder, error: insertError } = await supabase
        .from('service_orders_rg2024')
        .insert([serviceOrderData])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Service order insertion error:', insertError)
        throw new Error(`Failed to create service order: ${insertError.message}`)
      }

      console.log('✅ Service order created successfully:', insertedOrder)

      // Send email notifications
      try {
        console.log('📧 Sending service order notifications...')
        
        // Send notification to admin
        await EmailService.sendServiceOrderNotification({
          ...serviceOrderData,
          service_details: JSON.stringify(serviceOrderData.service_details, null, 2)
        })

        console.log('✅ Email notifications sent')
      } catch (emailError) {
        console.warn('⚠️ Email notification failed:', emailError)
        // Don't fail the order creation if email fails
      }

      alert('✅ Service order created successfully!')
      onClose()
      
      // Refresh the page to show the new order
      window.location.reload()

    } catch (error) {
      console.error('💥 Error creating service order:', error)
      alert(`❌ Error creating service order: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const currentService = getServiceDetails(serviceType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Order Service</h3>
            <p className="text-sm text-gray-600">{currentService.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Service</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'verification', name: 'Supplier Verification', cost: 50 },
                { id: 'inspection', name: 'Quality Inspection', cost: 350 },
                { id: 'testing', name: 'Laboratory Testing', cost: 'Quote' },
                { id: 'shipping', name: 'Shipping Coordination', cost: 'Quote' },
                { id: 'certificates', name: 'Certificates', cost: 'Quote' }
              ].map((svc) => (
                <label key={svc.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={svc.id}
                    {...register('serviceType', { required: 'Please select a service' })}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{svc.name}</div>
                    <div className="text-xs text-green-600 font-semibold">
                      {typeof svc.cost === 'number' ? `$${svc.cost}` : svc.cost}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>}
          </div>

          {/* Service Cost Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{currentService.name}</h4>
                <p className="text-sm text-blue-700">{currentService.description}</p>
                {currentService.note && (
                  <p className="text-xs text-blue-600 mt-1">Note: {currentService.note}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {currentService.cost > 0 ? `$${currentService.cost}` : 'TBD'}
                </div>
                <div className="text-xs text-blue-600">
                  {currentService.cost === 0 ? 'Quote on request' : 'Fixed price'}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Verification Form */}
          {serviceType === 'verification' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
                <SafeIcon icon={FiBuilding} className="h-5 w-5 mr-2" />
                Supplier Verification Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiBuilding} className="inline h-4 w-4 mr-1" />
                    Company Name (English) *
                  </label>
                  <input
                    type="text"
                    {...register('companyNameEnglish', {
                      required: serviceType === 'verification' ? 'Company name in English is required' : false
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter company name in English"
                  />
                  {errors.companyNameEnglish && <p className="text-red-500 text-sm mt-1">{errors.companyNameEnglish.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiGlobe} className="inline h-4 w-4 mr-1" />
                    Company Name (Chinese) - Optional
                  </label>
                  <input
                    type="text"
                    {...register('companyNameChinese')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="公司中文名称 (可选)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiFileText} className="inline h-4 w-4 mr-1" />
                    Company Registration Number *
                  </label>
                  <input
                    type="text"
                    {...register('registrationNumber', {
                      required: serviceType === 'verification' ? 'Registration number is required' : false
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter official registration number"
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUpload} className="inline h-4 w-4 mr-1" />
                    Business License Copy - Optional
                  </label>
                  <input
                    type="file"
                    {...register('businessLicenseCopy')}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or image files</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiGlobe} className="inline h-4 w-4 mr-1" />
                    Website or Alibaba.com Link - Optional
                  </label>
                  <input
                    type="url"
                    {...register('websiteOrLink')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://company.com or https://alibaba.com/company"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information - Optional
                  </label>
                  <textarea
                    {...register('additionalInfo')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Any additional information about the supplier..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quality Control Form */}
          {serviceType === 'inspection' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 mr-2" />
                Quality Control Inspection Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiBuilding} className="inline h-4 w-4 mr-1" />
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    {...register('qcSupplierName', {
                      required: serviceType === 'inspection' ? 'Supplier name is required' : false
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter supplier company name"
                  />
                  {errors.qcSupplierName && <p className="text-red-500 text-sm mt-1">{errors.qcSupplierName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" />
                    Supplier Contact Person *
                  </label>
                  <input
                    type="text"
                    {...register('qcSupplierContact', {
                      required: serviceType === 'inspection' ? 'Contact person is required' : false
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Contact person name"
                  />
                  {errors.qcSupplierContact && <p className="text-red-500 text-sm mt-1">{errors.qcSupplierContact.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
                    Supplier Email - Optional
                  </label>
                  <input
                    type="email"
                    {...register('qcSupplierEmail')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="supplier@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiPhone} className="inline h-4 w-4 mr-1" />
                    Supplier Phone - Optional
                  </label>
                  <input
                    type="tel"
                    {...register('qcSupplierPhone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+86 xxx xxxx xxxx"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMapPin} className="inline h-4 w-4 mr-1" />
                    Supplier Address - Optional
                  </label>
                  <textarea
                    {...register('qcSupplierAddress')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Factory or office address for inspection"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUpload} className="inline h-4 w-4 mr-1" />
                    PI (Proforma Invoice) File - Optional
                  </label>
                  <input
                    type="file"
                    {...register('piFile')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or Excel files</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description
                  </label>
                  <input
                    type="text"
                    {...register('productDescription')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief product description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Requirements
                  </label>
                  <textarea
                    {...register('inspectionRequirements')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Specific inspection requirements, quality standards, or areas of concern..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* General Service Requirements for Other Services */}
          {!['verification', 'inspection'].includes(serviceType) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Service Requirements</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Requirements
                </label>
                <textarea
                  {...register('serviceRequirements')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Please describe your requirements in detail..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  {...register('additionalInfo')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any additional information or special requests..."
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <SafeIcon icon={FiDollarSign} className="h-4 w-4" />
              <span>{loading ? 'Creating Order...' : `Order Service (${currentService.cost > 0 ? `$${currentService.cost}` : 'Quote on Request'})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ServiceOrderModal