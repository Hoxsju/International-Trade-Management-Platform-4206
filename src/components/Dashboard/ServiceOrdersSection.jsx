import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ServiceOrderModal from '../Services/ServiceOrderModal'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiShield, FiSearch, FiTool, FiTruck, FiAward } = FiIcons

const ServiceOrdersSection = ({ userProfile }) => {
  const { user } = useAuth()
  const [serviceOrders, setServiceOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    if (user) {
      fetchServiceOrders()
    }
  }, [user])

  const fetchServiceOrders = async () => {
    try {
      console.log('📊 Fetching service orders for buyer:', user.id)
      
      const { data, error } = await supabase
        .from('service_orders_rg2024')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('✅ Service orders fetched successfully:', data)
      setServiceOrders(data || [])
    } catch (error) {
      console.error('💥 Error fetching service orders:', error)
      // Don't alert here, just log the error
    } finally {
      setLoading(false)
    }
  }

  const handleOrderService = (serviceId) => {
    const services = {
      verification: { id: 'verification', name: 'Supplier Business Verification', cost: 50 },
      inspection: { id: 'inspection', name: 'On-site Quality Inspection', cost: 350 },
      testing: { id: 'testing', name: 'Laboratory Testing', cost: 0 },
      shipping: { id: 'shipping', name: 'Shipping Coordination', cost: 0 },
      certificates: { id: 'certificates', name: 'Certificate Request', cost: 0 }
    }
    
    setSelectedService(services[serviceId] || services.verification)
    setShowServiceModal(true)
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'verification': return FiShield
      case 'inspection': return FiSearch
      case 'testing': return FiTool
      case 'shipping': return FiTruck
      case 'certificates': return FiAward
      default: return FiPackage
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_review': return FiClock
      case 'in_progress': return FiPackage
      case 'completed': return FiCheckCircle
      case 'cancelled': return FiXCircle
      default: return FiClock
    }
  }

  const availableServices = [
    {
      id: 'verification',
      name: 'Supplier Verification',
      description: 'Comprehensive business verification',
      cost: 50,
      icon: FiShield,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'inspection',
      name: 'Quality Inspection',
      description: 'On-site quality control',
      cost: 350,
      icon: FiSearch,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      id: 'testing',
      name: 'Laboratory Testing',
      description: 'Professional product testing',
      cost: 'Quote',
      icon: FiTool,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      id: 'shipping',
      name: 'Shipping Coordination',
      description: 'End-to-end logistics',
      cost: 'Quote',
      icon: FiTruck,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'certificates',
      name: 'Certificates',
      description: 'CE, SGS, and compliance docs',
      cost: 'Quote',
      icon: FiAward,
      color: 'text-red-600 bg-red-50 border-red-200'
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Available Services */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Available Services</h2>
          <div className="text-sm text-gray-600">
            Order services individually as needed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableServices.map((service) => (
            <div key={service.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${service.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={service.icon} className="h-6 w-6" />
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm opacity-75">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {typeof service.cost === 'number' ? `$${service.cost}` : service.cost}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleOrderService(service.id)}
                className="w-full mt-3 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiPlus} className="h-4 w-4" />
                <span>Order Service</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Orders History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My Service Orders</h2>
          <button
            onClick={() => setShowServiceModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Order Service</span>
          </button>
        </div>

        {serviceOrders.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiPackage} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service orders yet</h3>
            <p className="text-gray-600 mb-4">Order individual services to enhance your trading experience</p>
            <button
              onClick={() => setShowServiceModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Order Your First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
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
                {serviceOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={getServiceIcon(order.service_type)} className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{order.service_name}</div>
                          <div className="text-xs text-gray-500">{order.service_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.service_order_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.service_cost > 0 ? `$${order.service_cost}` : 'TBD'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <SafeIcon icon={getStatusIcon(order.status)} className="h-3 w-3 mr-1" />
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center space-x-1">
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

      {/* Service Order Modal */}
      {showServiceModal && (
        <ServiceOrderModal
          service={selectedService}
          onClose={() => {
            setShowServiceModal(false)
            setSelectedService(null)
          }}
          userProfile={userProfile}
        />
      )}
    </div>
  )
}

export default ServiceOrdersSection