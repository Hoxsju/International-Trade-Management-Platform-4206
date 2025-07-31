import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiTrendingUp } = FiIcons

const UserGrowthChart = ({ data, detailed = false }) => {
  const totalUsers = data.reduce((sum, item) => sum + item.newUsers, 0)
  const maxValue = Math.max(...data.map(item => item.totalUsers))
  const growth = data.length > 1 ? 
    ((data[data.length - 1].totalUsers - data[0].totalUsers) / data[0].totalUsers * 100) : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          <p className="text-sm text-gray-600">User acquisition and growth trends</p>
        </div>
        <SafeIcon icon={FiUsers} className="h-6 w-6 text-blue-600" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</div>
          <div className="text-sm text-gray-600">New Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-1">
            <SafeIcon icon={FiTrendingUp} className="h-5 w-5" />
            <span>{growth.toFixed(1)}%</span>
          </div>
          <div className="text-sm text-gray-600">Growth Rate</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full relative group">
              {/* Total users line */}
              <div
                className="bg-blue-100 rounded-t"
                style={{
                  height: `${(item.totalUsers / maxValue) * 150}px`,
                  minHeight: '2px'
                }}
              ></div>
              {/* New users bar */}
              <div
                className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                style={{
                  height: `${(item.newUsers / maxValue) * 150}px`,
                  minHeight: '2px'
                }}
              ></div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                New: {item.newUsers} | Total: {item.totalUsers}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {item.period}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">New Users</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-sm text-gray-600">Total Users</span>
        </div>
      </div>

      {/* User Types Breakdown */}
      {detailed && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-3">User Types</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Buyers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-medium">60%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suppliers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-sm font-medium">35%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Admins</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-sm font-medium">5%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserGrowthChart