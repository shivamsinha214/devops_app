import { useState, useEffect } from 'react'
import { monitoringApi } from '../services/api'
import { FileText, Filter, RefreshCw, AlertTriangle, Info, XCircle } from 'lucide-react'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    service: '',
    level: '',
    limit: 100
  })

  useEffect(() => {
    fetchServices()
    fetchLogs()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchServices = async () => {
    try {
      const response = await monitoringApi.getServices()
      setServices(response.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await monitoringApi.getLogs(filters.service, filters.limit)
      let filteredLogs = response.data
      
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level)
      }
      
      setLogs(filteredLogs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-error-600 bg-error-50'
      case 'warn':
        return 'text-warning-600 bg-warning-50'
      case 'info':
        return 'text-primary-600 bg-primary-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'warn':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      service: '',
      level: '',
      limit: 100
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">View and filter application logs across all services</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="btn-primary flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={50}>50 entries</option>
              <option value={100}>100 entries</option>
              <option value={200}>200 entries</option>
              <option value={500}>500 entries</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Log Entries ({logs.length})
          </h2>
          {filters.service || filters.level ? (
            <span className="text-sm text-gray-500">
              Filtered results
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-gray-500 font-mono w-20">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>

                {/* Level Badge */}
                <div className={`flex-shrink-0 status-badge ${getLevelColor(log.level)}`}>
                  {getLevelIcon(log.level)}
                  <span className="ml-1 uppercase text-xs">
                    {log.level}
                  </span>
                </div>

                {/* Service */}
                <div className="flex-shrink-0 text-sm font-medium text-gray-700 w-32">
                  {log.service}
                </div>

                {/* Message */}
                <div className="flex-1 text-sm text-gray-900">
                  {log.message}
                </div>

                {/* Metadata */}
                {log.metadata && (
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {log.metadata.requestId && (
                      <span className="block">ID: {log.metadata.requestId.slice(0, 8)}</span>
                    )}
                    {log.metadata.userId && (
                      <span className="block">User: {log.metadata.userId}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No logs found</p>
            <p className="text-sm text-gray-400">
              {filters.service || filters.level
                ? 'Try adjusting your filters'
                : 'Logs will appear here as they are generated'
              }
            </p>
          </div>
        )}
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Logs</h3>
          <p className="text-3xl font-bold text-primary-600">{logs.length}</p>
          <p className="text-sm text-gray-500 mt-1">In current view</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Count</h3>
          <p className="text-3xl font-bold text-error-600">
            {logs.filter(log => log.level === 'error').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Errors in current view</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Warning Count</h3>
          <p className="text-3xl font-bold text-warning-600">
            {logs.filter(log => log.level === 'warn').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Warnings in current view</p>
        </div>
      </div>
    </div>
  )
} 