import React, { useState } from 'react'
import SafeIcon from '../../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCalendar, FiFilter, FiX, FiChevronDown, FiChevronUp } = FiIcons

const FilterPanel = ({ dateRange, onDateRangeChange, filters, onFilterChange, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ]

  const accountTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'buyer', label: 'Buyers' },
    { value: 'supplier', label: 'Suppliers' },
    { value: 'admin', label: 'Admins' }
  ]

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north_america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'other', label: 'Other' }
  ]

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      accountType: 'all',
      region: 'all',
      status: 'all'
    })
    onDateRangeChange('30d')
  }

  const hasActiveFilters = () => {
    return dateRange !== '30d' || 
           filters.accountType !== 'all' || 
           filters.region !== 'all' || 
           filters.status !== 'all' ||
           filters.startDate ||
           filters.endDate
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <SafeIcon icon={FiFilter} className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              <SafeIcon icon={isExpanded ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Date Range */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <SafeIcon icon={FiCalendar} className="h-4 w-4 text-gray-500 flex-shrink-0" />
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onDateRangeChange(range.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateRange === range.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}

            {/* Account Type Filter (Admin only) */}
            {userRole === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={filters.accountType}
                  onChange={(e) => handleFilterChange('accountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {accountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters() && (
            <div className="mt-4 flex flex-wrap gap-2">
              {dateRange !== '30d' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  {dateRanges.find(r => r.value === dateRange)?.label}
                  <button
                    onClick={() => onDateRangeChange('30d')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.accountType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {accountTypes.find(t => t.value === filters.accountType)?.label}
                  <button
                    onClick={() => handleFilterChange('accountType', 'all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.region !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {regions.find(r => r.value === filters.region)?.label}
                  <button
                    onClick={() => handleFilterChange('region', 'all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.status !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  {statuses.find(s => s.value === filters.status)?.label}
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <SafeIcon icon={FiX} className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel