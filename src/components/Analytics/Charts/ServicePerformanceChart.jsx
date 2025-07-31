import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield, FiSearch, FiTool, FiTruck, FiAward } = FiIcons

const ServicePerformanceChart = ({ data }) => {
  const serviceIcons = {
    verification: FiShield,
    inspection: FiSearch,
    testing: FiTool,
    shipping: FiTruck,
    certificates: FiAward
  }

  const maxRevenue = Math.max(...data.map(item => item.revenue))

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
          <p className="text-sm text-gray-600">Revenue by service type</p>
        </div>
        <SafeIcon icon={FiTool} className="h-6 w-6 text-orange-600" />
      </div>

      <div className="space-y-4">
        {data.map((service, index) => {
          const IconComponent = serviceIcons[service.type] || FiTool
          const percentage = maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={IconComponent} className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900 capitalize">{service.type}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${service.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{service.orders} orders</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.orders, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              ${data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Revenue</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              ${data.length > 0 ? (data.reduce((sum, item) => sum + item.revenue, 0) / data.reduce((sum, item) => sum + item.orders, 0)).toFixed(0) : 0}
            </div>
            <div className="text-xs text-gray-600">Avg Order Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServicePerformanceChart