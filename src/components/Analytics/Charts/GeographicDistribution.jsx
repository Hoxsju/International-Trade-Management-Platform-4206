import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMap, FiGlobe } = FiIcons

const GeographicDistribution = ({ data }) => {
  const totalUsers = data.reduce((sum, item) => sum + item.users, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <div className="space-y-6">
      {/* World Map Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            <p className="text-sm text-gray-600">User and revenue distribution by region</p>
          </div>
          <SafeIcon icon={FiMap} className="h-6 w-6 text-blue-600" />
        </div>

        {/* Map Placeholder */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 mb-6">
          <div className="text-center">
            <SafeIcon icon={FiGlobe} className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Interactive World Map</h4>
            <p className="text-gray-600">Geographic visualization would be displayed here</p>
            <p className="text-sm text-gray-500 mt-2">
              Integration with mapping libraries like Mapbox or Google Maps for production
            </p>
          </div>
        </div>

        {/* Regional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((region, index) => {
            const userPercentage = totalUsers > 0 ? (region.users / totalUsers * 100) : 0
            const revenuePercentage = totalRevenue > 0 ? (region.revenue / totalRevenue * 100) : 0
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{region.country}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {region.code}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">{region.users.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${userPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-medium">${region.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Regions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Regions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.slice(0, 10).map((region, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {region.country}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {region.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${region.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${region.users > 0 ? (region.revenue / region.users).toFixed(0) : 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      region.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {region.growth >= 0 ? '+' : ''}{region.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GeographicDistribution