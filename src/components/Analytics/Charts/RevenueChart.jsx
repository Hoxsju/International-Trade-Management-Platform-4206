import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDollarSign, FiTrendingUp, FiTrendingDown } = FiIcons

const RevenueChart = ({ data, detailed = false }) => {
  // Calculate metrics
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0
  const growth = data.length > 1 ? 
    ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue * 100) : 0

  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.revenue))

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-600">Revenue trends over time</p>
        </div>
        <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-green-600" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">${avgRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Average</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold flex items-center justify-center space-x-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <SafeIcon icon={growth >= 0 ? FiTrendingUp : FiTrendingDown} className="h-5 w-5" />
            <span>{Math.abs(growth).toFixed(1)}%</span>
          </div>
          <div className="text-sm text-gray-600">Growth</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-200 rounded-t relative group">
              <div
                className="bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500"
                style={{
                  height: `${(item.revenue / maxValue) * 200}px`,
                  minHeight: '4px'
                }}
              ></div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${item.revenue.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {item.period}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      {detailed && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
          <div className="space-y-2">
            {data.slice(-5).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.period}</span>
                <span className="font-medium">${item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueChart