import React from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDollarSign, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown, FiMinus } = FiIcons

const KPICards = ({ data }) => {
  const kpis = [
    {
      title: 'Total Revenue',
      value: data.totalRevenue || 0,
      format: 'currency',
      change: data.revenueChange || 0,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Users',
      value: data.activeUsers || 0,
      format: 'number',
      change: data.userChange || 0,
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Orders',
      value: data.totalOrders || 0,
      format: 'number',
      change: data.orderChange || 0,
      icon: FiPackage,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Order Value',
      value: data.avgOrderValue || 0,
      format: 'currency',
      change: data.aovChange || 0,
      icon: FiTrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return `$${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  const getTrendIcon = (change) => {
    if (change > 0) return FiTrendingUp
    if (change < 0) return FiTrendingDown
    return FiMinus
  }

  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(kpi.value, kpi.format)}
              </p>
              <div className={`flex items-center space-x-1 mt-2 ${getTrendColor(kpi.change)}`}>
                <SafeIcon icon={getTrendIcon(kpi.change)} className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {Math.abs(kpi.change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            </div>
            <div className={`${kpi.bgColor} p-3 rounded-lg`}>
              <SafeIcon icon={kpi.icon} className={`h-6 w-6 ${kpi.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KPICards