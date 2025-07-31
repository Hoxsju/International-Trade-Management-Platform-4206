import React, { useState } from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiTrendingUp, FiTrendingDown, FiActivity, FiTarget } = FiIcons

const TrendAnalysis = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  
  const metrics = [
    { id: 'revenue', label: 'Revenue', icon: FiTrendingUp, color: 'text-green-600' },
    { id: 'users', label: 'Users', icon: FiActivity, color: 'text-blue-600' },
    { id: 'orders', label: 'Orders', icon: FiTarget, color: 'text-purple-600' }
  ]

  const currentData = data[selectedMetric] || []
  const maxValue = Math.max(...currentData.map(item => item.value))

  const calculateTrend = (data) => {
    if (data.length < 2) return 0
    const recent = data.slice(-3).reduce((sum, item) => sum + item.value, 0) / 3
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item.value, 0) / 3
    return previous > 0 ? ((recent - previous) / previous * 100) : 0
  }

  const trend = calculateTrend(currentData)

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            <p className="text-sm text-gray-600">Performance trends and forecasting</p>
          </div>
          <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-green-600" />
        </div>

        {/* Metric Selector */}
        <div className="flex space-x-4 mb-6">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={metric.icon} className="h-4 w-4" />
              <span>{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 capitalize">{selectedMetric} Trend</h4>
            <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <SafeIcon icon={trend >= 0 ? FiTrendingUp : FiTrendingDown} className="h-4 w-4" />
              <span className="font-medium">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end space-x-1">
            {currentData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full relative group">
                  <div
                    className="bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-500"
                    style={{
                      height: `${(item.value / maxValue) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {item.period}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentData.length > 0 ? currentData[currentData.length - 1].value.toLocaleString() : 0}
            </div>
            <div className="text-sm text-blue-700">Current Period</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-700">Trend Direction</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {currentData.length > 0 ? (currentData.reduce((sum, item) => sum + item.value, 0) / currentData.length).toFixed(0) : 0}
            </div>
            <div className="text-sm text-purple-700">Average</div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <SafeIcon icon={FiTrendingUp} className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Growth Forecast</p>
              <p className="text-blue-700 text-sm">
                Based on current trends, {selectedMetric} is projected to {trend >= 0 ? 'increase' : 'decrease'} by {Math.abs(trend * 1.2).toFixed(1)}% next period.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
            <SafeIcon icon={FiTarget} className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Seasonality Pattern</p>
              <p className="text-yellow-700 text-sm">
                Historical data suggests {selectedMetric} typically peaks in Q4 and shows steady growth during Q2-Q3.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <SafeIcon icon={FiActivity} className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Optimization Opportunity</p>
              <p className="text-green-700 text-sm">
                Focus on user acquisition in underperforming regions to maximize {selectedMetric} growth potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis