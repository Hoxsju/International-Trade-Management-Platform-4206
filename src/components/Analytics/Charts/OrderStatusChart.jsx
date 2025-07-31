import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiPackage, FiClock, FiCheckCircle, FiXCircle } = FiIcons

const OrderStatusChart = ({ data, detailed = false }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  const statusConfig = {
    pending_review: { color: 'bg-yellow-500', icon: FiClock, label: 'Pending Review' },
    approved: { color: 'bg-blue-500', icon: FiCheckCircle, label: 'Approved' },
    in_progress: { color: 'bg-purple-500', icon: FiPackage, label: 'In Progress' },
    completed: { color: 'bg-green-500', icon: FiCheckCircle, label: 'Completed' },
    rejected: { color: 'bg-red-500', icon: FiXCircle, label: 'Rejected' }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
          <p className="text-sm text-gray-600">Current order status breakdown</p>
        </div>
        <SafeIcon icon={FiPackage} className="h-6 w-6 text-purple-600" />
      </div>

      {/* Donut Chart Simulation */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <div className="w-full h-full rounded-full bg-gray-200 relative overflow-hidden">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100
              const config = statusConfig[item.status] || { color: 'bg-gray-500' }
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 ${config.color} opacity-80`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + percentage * 0.5}% 0%, 50% 50%)`
                  }}
                ></div>
              )
            })}
          </div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const config = statusConfig[item.status] || { color: 'bg-gray-500', icon: FiPackage, label: item.status }
          const percentage = total > 0 ? (item.count / total * 100).toFixed(1) : 0
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <SafeIcon icon={config.icon} className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{config.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-gray-500">({percentage}%)</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Metrics */}
      {detailed && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {data.find(item => item.status === 'completed')?.count || 0}
              </div>
              <div className="text-xs text-gray-600">Completed Orders</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {((data.find(item => item.status === 'completed')?.count || 0) / total * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatusChart