import { useState, useEffect } from 'react'
import { monitoringApi } from '../services/api'
import { Server, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Monitoring() {
  const [services, setServices] = useState([])
  const [environments, setEnvironments] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedService) {
      fetchServiceMetrics(selectedService)
    }
  }, [selectedService])

  const fetchMonitoringData = async () => {
    try {
      const [servicesRes, environmentsRes] = await Promise.all([
        monitoringApi.getServices(),
        monitoringApi.getEnvironments()
      ])
      
      setServices(servicesRes.data)
      setEnvironments(environmentsRes.data)
      
      if (!selectedService && servicesRes.data.length > 0) {
        setSelectedService(servicesRes.data[0].name)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceMetrics = async (serviceName) => {
    try {
      const response = await monitoringApi.getMetrics(serviceName)
      setMetrics(response.data)
    } catch (error) {
      console.error('Failed to fetch service metrics:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return 'text-success-600 bg-success-50'
      case 'warning':
      case 'degraded':
        return 'text-warning-600 bg-warning-50'
      case 'error':
      case 'stopped':
      case 'down':
        return 'text-error-600 bg-error-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
      case 'stopped':
      case 'down':
        return <XCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getUsageColor = (percentage) => {
    if (percentage > 80) return 'bg-error-500'
    if (percentage > 60) return 'bg-warning-500'
    return 'bg-success-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
        <p className="text-gray-600">Monitor services, environments, and system performance</p>
      </div>

      {/* Environment Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environments.map((env) => (
            <div key={env.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{env.name}</h3>
                <span className={`status-badge ${getStatusColor(env.status)}`}>
                  {getStatusIcon(env.status)}
                  <span className="ml-1">{env.status}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">{env.type}</p>
              {env.url && (
                <a
                  href={env.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-800 mt-1 inline-block"
                >
                  View Environment →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Services Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedService === service.name
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedService(service.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                </div>
                <span className={`status-badge ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1">{service.status}</span>
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Version:</span>
                  <span className="text-gray-900">v{service.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Instances:</span>
                  <span className="text-gray-900">{service.instances}</span>
                </div>
                
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">CPU:</span>
                    <span className="text-gray-900">{service.cpu}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(service.cpu)}`}
                      style={{ width: `${service.cpu}%` }}
                    />
                  </div>
                </div>
                
                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Memory:</span>
                    <span className="text-gray-900">{service.memory}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(service.memory)}`}
                      style={{ width: `${service.memory}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Metrics Chart */}
      {selectedService && metrics.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedService} - Performance Metrics (24 Hours)
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory Chart */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">CPU & Memory Usage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    name="CPU"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    name="Memory"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Requests & Errors Chart */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Requests & Errors</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => [value, name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    name="Requests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* System Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Services</h3>
          <p className="text-3xl font-bold text-primary-600">{services.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {services.filter(s => s.status === 'running').length} running
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Instances</h3>
          <p className="text-3xl font-bold text-success-600">
            {services.reduce((sum, s) => sum + s.instances, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all services</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Avg Response Time</h3>
          <p className="text-3xl font-bold text-warning-600">
            {metrics.length > 0 
              ? Math.round(metrics[metrics.length - 1]?.responseTime || 0)
              : 0}ms
          </p>
          <p className="text-sm text-gray-500 mt-1">Latest measurement</p>
        </div>
      </div>
    </div>
  )
} 