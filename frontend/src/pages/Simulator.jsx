import { useState, useEffect } from 'react'
import { simulatorApi } from '../services/api'
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Terminal,
  Rocket,
  Settings
} from 'lucide-react'

export default function Simulator() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [deploymentConfig, setDeploymentConfig] = useState({
    serviceName: '',
    version: '',
    environment: 'Development',
    deployedBy: 'simulator-user'
  })
  const [activeSimulation, setActiveSimulation] = useState(null)
  const [simulationStatus, setSimulationStatus] = useState(null)
  const [simulationLogs, setSimulationLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    let interval
    if (activeSimulation && simulationStatus?.status === 'running') {
      interval = setInterval(fetchSimulationStatus, 2000) // Poll every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeSimulation, simulationStatus?.status])

  const fetchTemplates = async () => {
    try {
      const response = await simulatorApi.getTemplates()
      setTemplates(response.data)
      if (response.data.length > 0) {
        setSelectedTemplate(response.data[0])
        setDeploymentConfig(prev => ({
          ...prev,
          serviceName: response.data[0].services[0]
        }))
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchSimulationStatus = async () => {
    if (!activeSimulation) return
    
    try {
      const response = await simulatorApi.getStatus(activeSimulation)
      setSimulationStatus(response.data)
      
      // Fetch logs if simulation is running
      const logsResponse = await simulatorApi.getLogs(activeSimulation)
      setSimulationLogs(logsResponse.data.logs)
      
      // If simulation completed or failed, stop polling
      if (response.data.status === 'completed' || response.data.status === 'failed' || response.data.status === 'cancelled') {
        setActiveSimulation(null)
      }
    } catch (error) {
      console.error('Failed to fetch simulation status:', error)
    }
  }

  const startSimulation = async () => {
    if (!deploymentConfig.serviceName || !deploymentConfig.version) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await simulatorApi.start(deploymentConfig)
      setActiveSimulation(response.data.deploymentId)
      setSimulationStatus({
        status: 'running',
        currentStep: 0,
        totalSteps: response.data.totalSteps,
        progress: 0
      })
      setSimulationLogs([])
    } catch (error) {
      console.error('Failed to start simulation:', error)
      alert('Failed to start simulation')
    } finally {
      setLoading(false)
    }
  }

  const stopSimulation = async () => {
    if (!activeSimulation) return

    try {
      await simulatorApi.stop(activeSimulation)
      setActiveSimulation(null)
      setSimulationStatus(prev => ({ ...prev, status: 'cancelled' }))
    } catch (error) {
      console.error('Failed to stop simulation:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50'
      case 'failed':
        return 'text-error-600 bg-error-50'
      case 'running':
        return 'text-primary-600 bg-primary-50'
      case 'cancelled':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-error-600'
      case 'warn':
        return 'text-warning-600'
      case 'info':
        return 'text-primary-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployment Simulator</h1>
          <p className="text-gray-600">Simulate deployment processes to understand the workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Deployment Configuration
          </h2>

          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value)
                  setSelectedTemplate(template)
                  if (template) {
                    setDeploymentConfig(prev => ({
                      ...prev,
                      serviceName: template.services[0]
                    }))
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <select
                value={deploymentConfig.serviceName}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, serviceName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={!selectedTemplate}
              >
                {selectedTemplate?.services.map(service => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version *
              </label>
              <input
                type="text"
                value={deploymentConfig.version}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 1.2.3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                value={deploymentConfig.environment}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {selectedTemplate?.environments.map(env => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>

            {/* Deployed By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deployed By
              </label>
              <input
                type="text"
                value={deploymentConfig.deployedBy}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, deployedBy: e.target.value }))}
                placeholder="Your name or email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={startSimulation}
                disabled={loading || activeSimulation}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Starting...' : 'Start Deployment'}
              </button>
              {activeSimulation && (
                <button
                  onClick={stopSimulation}
                  className="btn-error flex items-center"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Status */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Rocket className="h-5 w-5 mr-2" />
            Simulation Status
          </h2>

          {simulationStatus ? (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`status-badge ${getStatusColor(simulationStatus.status)}`}>
                  {simulationStatus.status === 'running' && <Clock className="h-4 w-4 mr-1" />}
                  {simulationStatus.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {simulationStatus.status === 'failed' && <XCircle className="h-4 w-4 mr-1" />}
                  {simulationStatus.status === 'cancelled' && <AlertTriangle className="h-4 w-4 mr-1" />}
                  {simulationStatus.status}
                </span>
                <span className="text-sm text-gray-500">
                  {simulationStatus.currentStep}/{simulationStatus.totalSteps} steps
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{simulationStatus.progress || 0}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${simulationStatus.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Current Step */}
              {simulationStatus.currentStepName && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    Current Step: {simulationStatus.currentStepName}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active simulation</p>
              <p className="text-sm text-gray-400">Configure and start a deployment to see the progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Logs */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Terminal className="h-5 w-5 mr-2" />
          Deployment Logs
        </h2>

        <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
          {simulationLogs.length > 0 ? (
            simulationLogs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`ml-2 ${getLogLevelColor(log.level)}`}>
                  [{log.level?.toUpperCase() || 'INFO'}]
                </span>
                <span className="ml-2 text-gray-100">
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-8">
              No logs available. Start a simulation to see deployment logs.
            </div>
          )}
        </div>
      </div>

      {/* Template Information */}
      {selectedTemplate && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Available Services</h3>
              <ul className="space-y-1">
                {selectedTemplate.services.map(service => (
                  <li key={service} className="text-sm text-gray-600 flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Target Environments</h3>
              <ul className="space-y-1">
                {selectedTemplate.environments.map(env => (
                  <li key={env} className="text-sm text-gray-600 flex items-center">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-2" />
                    {env}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {selectedTemplate.description}
          </p>
        </div>
      )}
    </div>
  )
} 