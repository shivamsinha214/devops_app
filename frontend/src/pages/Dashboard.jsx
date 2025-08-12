import { useState, useEffect } from 'react'
import { dashboardApi } from '../services/api'
import { 
  Activity, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)
  const [recentDeployments, setRecentDeployments] = useState([])
  const [deploymentTrends, setDeploymentTrends] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, healthRes, deploymentsRes, trendsRes, alertsRes] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getSystemHealth(),
        dashboardApi.getRecentDeployments(5),
        dashboardApi.getDeploymentTrends(7),
        dashboardApi.getAlerts()
      ])

      setOverview(overviewRes.data)
      setSystemHealth(healthRes.data)
      setRecentDeployments(deploymentsRes.data)
      setDeploymentTrends(trendsRes.data)
      setAlerts(alertsRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'running':
      case 'healthy':
        return 'text-success-600 bg-success-50'
      case 'warning':
      case 'degraded':
        return 'text-warning-600 bg-warning-50'
      case 'failed':
      case 'error':
      case 'critical':
      case 'down':
        return 'text-error-600 bg-error-50'
      case 'in-progress':
        return 'text-primary-600 bg-primary-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-success-600'
    if (score >= 60) return 'text-warning-600'
    return 'text-error-600'
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Health */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className={`h-8 w-8 ${getHealthColor(systemHealth?.overallHealth || 0)}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">System Health</p>
              <p className={`text-2xl font-semibold ${getHealthColor(systemHealth?.overallHealth || 0)}`}>
                {systemHealth?.overallHealth || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Services</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview?.services.healthy || 0}/{overview?.services.total || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Deployments Today */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deployments Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview?.activity.recentDeployments || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Active Instances */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Instances</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview?.systemMetrics.totalInstances || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Trends (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deploymentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Metrics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Average CPU Usage</span>
                <span>{overview?.systemMetrics.avgCpu || 0}%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overview?.systemMetrics.avgCpu || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Average Memory Usage</span>
                <span>{overview?.systemMetrics.avgMemory || 0}%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-warning-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overview?.systemMetrics.avgMemory || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span>{systemHealth?.errorRate || 0}%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-error-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemHealth?.errorRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Deployments</h3>
          <div className="space-y-3">
            {recentDeployments.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(deployment.status)}`}>
                    {deployment.status === 'success' && <CheckCircle className="h-4 w-4" />}
                    {deployment.status === 'failed' && <XCircle className="h-4 w-4" />}
                    {deployment.status === 'in-progress' && <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{deployment.serviceName}</p>
                    <p className="text-sm text-gray-500">v{deployment.version} → {deployment.environment}</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(deployment.status)}`}>
                  {deployment.status}
                </span>
              </div>
            ))}
            {recentDeployments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent deployments</p>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${alert.severity === 'critical' ? 'text-error-600' : 'text-warning-600'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 