import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AnalyticsService } from '../../services/analyticsService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import RevenueChart from './Charts/RevenueChart'
import UserGrowthChart from './Charts/UserGrowthChart'
import OrderStatusChart from './Charts/OrderStatusChart'
import ServicePerformanceChart from './Charts/ServicePerformanceChart'
import GeographicDistribution from './Charts/GeographicDistribution'
import TrendAnalysis from './Charts/TrendAnalysis'
import KPICards from './Components/KPICards'
import ExportTools from './Components/ExportTools'
import FilterPanel from './Components/FilterPanel'

const { FiBarChart3, FiTrendingUp, FiPieChart, FiMap, FiDownload, FiRefreshCw, FiCalendar, FiFilter } = FiIcons

const AdvancedAnalytics = ({ userProfile }) => {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    accountType: 'all',
    region: 'all',
    status: 'all'
  })

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (userProfile && user) {
      fetchAnalyticsData()
    }
  }, [userProfile, user, dateRange, filters])

  const fetchAnalyticsData = async () => {
    if (refreshing) return
    
    setLoading(true)
    try {
      console.log('📊 Fetching advanced analytics data...')
      
      const analyticsResult = await AnalyticsService.getComprehensiveAnalytics({
        dateRange,
        filters,
        userId: user.id,
        userRole: userProfile.account_type
      })

      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data)
        console.log('✅ Analytics data loaded successfully')
      } else {
        throw new Error(analyticsResult.error)
      }
    } catch (error) {
      console.error('💥 Failed to load analytics:', error)
      // Don't show alert for analytics errors, just log them
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
  }

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
    // Reset custom date filters when using preset ranges
    if (newRange !== 'custom') {
      setFilters(prev => ({
        ...prev,
        startDate: null,
        endDate: null
      }))
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart3 },
    { id: 'revenue', label: 'Revenue', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiPieChart },
    { id: 'orders', label: 'Orders', icon: FiBarChart3 },
    { id: 'geographic', label: 'Geographic', icon: FiMap },
    { id: 'trends', label: 'Trends', icon: FiTrendingUp }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <ExportTools 
            data={analyticsData} 
            dateRange={dateRange}
            filters={filters}
          />
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        userRole={userProfile.account_type}
      />

      {/* KPI Cards */}
      <KPICards data={analyticsData.kpis || {}} />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={analyticsData.revenue || []} />
            <UserGrowthChart data={analyticsData.userGrowth || []} />
            <OrderStatusChart data={analyticsData.orderStatus || []} />
            <ServicePerformanceChart data={analyticsData.servicePerformance || []} />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart 
                  data={analyticsData.revenue || []} 
                  detailed={true}
                />
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {analyticsData.revenueBreakdown?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-semibold">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">MoM Growth</span>
                      <span className={`font-semibold ${analyticsData.growthMetrics?.mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData.growthMetrics?.mom}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">YoY Growth</span>
                      <span className={`font-semibold ${analyticsData.growthMetrics?.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData.growthMetrics?.yoy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserGrowthChart data={analyticsData.userGrowth || []} detailed={true} />
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
              {/* User demographics chart would go here */}
              <div className="space-y-4">
                {analyticsData.userDemographics?.map((demo, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{demo.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${demo.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{demo.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OrderStatusChart data={analyticsData.orderStatus || []} detailed={true} />
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-semibold">${analyticsData.orderMetrics?.averageValue || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-green-600">{analyticsData.orderMetrics?.completionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Processing Time</span>
                      <span className="font-semibold">{analyticsData.orderMetrics?.avgProcessingTime || 0} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="space-y-6">
            <GeographicDistribution data={analyticsData.geographic || []} />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <TrendAnalysis data={analyticsData.trends || []} />
          </div>
        )}
      </div>

      {/* Insights Panel */}
      {analyticsData.insights && analyticsData.insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h2>
          <div className="space-y-3">
            {analyticsData.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-medium">{insight.title}</p>
                  <p className="text-blue-700 text-sm">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-blue-600 text-sm mt-1">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalytics