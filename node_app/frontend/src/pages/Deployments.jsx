import { useState, useEffect } from 'react'
import { deploymentsApi } from '../services/api'
import { CheckCircle, XCircle, Clock, Plus, Rocket } from 'lucide-react'

export default function Deployments() {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDeployment, setNewDeployment] = useState({
    serviceName: '',
    version: '',
    environment: 'Development',
    deployedBy: ''
  })

  useEffect(() => {
    fetchDeployments()
  }, [])

  const fetchDeployments = async () => {
    try {
      const response = await deploymentsApi.getAll()
      setDeployments(response.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)))
    } catch (error) {
      console.error('Failed to fetch deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeployment = async (e) => {
    e.preventDefault()
    try {
      await deploymentsApi.create(newDeployment)
      setNewDeployment({
        serviceName: '',
        version: '',
        environment: 'Development',
        deployedBy: ''
      })
      setShowCreateForm(false)
      fetchDeployments()
    } catch (error) {
      console.error('Failed to create deployment:', error)
      alert('Failed to create deployment')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-success-600 bg-success-50'
      case 'failed':
        return 'text-error-600 bg-error-50'
      case 'in-progress':
        return 'text-primary-600 bg-primary-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-600">Manage and track your application deployments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Deployment
        </button>
      </div>

      {/* Create Deployment Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Deployment</h2>
          <form onSubmit={handleCreateDeployment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDeployment.serviceName}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, serviceName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., User Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={newDeployment.version}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 1.2.3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={newDeployment.environment}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deployed By
                </label>
                <input
                  type="text"
                  value={newDeployment.deployedBy}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, deployedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name or email"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Create Deployment
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deployments List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployments</h2>
        
        {deployments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deployed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deployments.map((deployment) => (
                  <tr key={deployment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Rocket className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {deployment.serviceName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      v{deployment.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deployment.environment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${getStatusColor(deployment.status)}`}>
                        {getStatusIcon(deployment.status)}
                        <span className="ml-1">{deployment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(deployment.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(deployment.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deployment.deployedBy || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No deployments found</p>
            <p className="text-sm text-gray-400">Create your first deployment to get started</p>
          </div>
        )}
      </div>
    </div>
  )
} 