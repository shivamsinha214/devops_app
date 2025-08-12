const { v4: uuidv4 } = require('uuid');

// In-memory database
class InMemoryDB {
  constructor() {
    this.deployments = new Map();
    this.services = new Map();
    this.logs = new Map();
    this.metrics = new Map();
    this.environments = new Map();
    this.pipelines = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample environments
    const environments = [
      { id: 'env-1', name: 'Development', type: 'dev', status: 'healthy', url: 'https://dev.example.com' },
      { id: 'env-2', name: 'Staging', type: 'staging', status: 'healthy', url: 'https://staging.example.com' },
      { id: 'env-3', name: 'Production', type: 'prod', status: 'healthy', url: 'https://prod.example.com' }
    ];
    
    environments.forEach(env => this.environments.set(env.id, env));

    // Sample services
    const services = [
      { 
        id: 'svc-1', 
        name: 'User Service', 
        status: 'running', 
        version: '1.2.3',
        instances: 3,
        cpu: 45,
        memory: 67,
        environment: 'prod'
      },
      { 
        id: 'svc-2', 
        name: 'Payment Service', 
        status: 'running', 
        version: '2.1.0',
        instances: 2,
        cpu: 32,
        memory: 54,
        environment: 'prod'
      },
      { 
        id: 'svc-3', 
        name: 'Notification Service', 
        status: 'warning', 
        version: '1.0.8',
        instances: 1,
        cpu: 78,
        memory: 89,
        environment: 'prod'
      }
    ];
    
    services.forEach(svc => this.services.set(svc.id, svc));

    // Sample deployments
    const deployments = [
      {
        id: 'dep-1',
        serviceName: 'User Service',
        version: '1.2.3',
        environment: 'Production',
        status: 'success',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3300000).toISOString(),
        duration: 300,
        deployedBy: 'john.doe@company.com'
      },
      {
        id: 'dep-2',
        serviceName: 'Payment Service',
        version: '2.1.0',
        environment: 'Staging',
        status: 'in-progress',
        startTime: new Date(Date.now() - 600000).toISOString(),
        endTime: null,
        duration: null,
        deployedBy: 'jane.smith@company.com'
      }
    ];
    
    deployments.forEach(dep => this.deployments.set(dep.id, dep));

    // Sample logs
    this.generateSampleLogs();
    
    // Sample metrics
    this.generateSampleMetrics();
  }

  generateSampleLogs() {
    const logTypes = ['info', 'warn', 'error'];
    const services = ['User Service', 'Payment Service', 'Notification Service'];
    const messages = [
      'Request processed successfully',
      'Database connection established',
      'Cache miss for user data',
      'High memory usage detected',
      'API rate limit exceeded',
      'Service health check passed'
    ];

    for (let i = 0; i < 50; i++) {
      const log = {
        id: uuidv4(),
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        level: logTypes[Math.floor(Math.random() * logTypes.length)],
        service: services[Math.floor(Math.random() * services.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        metadata: {
          requestId: uuidv4(),
          userId: Math.floor(Math.random() * 1000)
        }
      };
      this.logs.set(log.id, log);
    }
  }

  generateSampleMetrics() {
    const now = Date.now();
    const services = ['User Service', 'Payment Service', 'Notification Service'];
    
    services.forEach(service => {
      const metrics = [];
      for (let i = 0; i < 24; i++) {
        metrics.push({
          timestamp: new Date(now - (i * 3600000)).toISOString(),
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          requests: Math.floor(Math.random() * 1000),
          errors: Math.floor(Math.random() * 50),
          responseTime: Math.random() * 500
        });
      }
      this.metrics.set(service, metrics);
    });
  }

  // CRUD operations for deployments
  getAllDeployments() {
    return Array.from(this.deployments.values());
  }

  getDeploymentById(id) {
    return this.deployments.get(id);
  }

  createDeployment(deployment) {
    const id = uuidv4();
    const newDeployment = {
      id,
      ...deployment,
      startTime: new Date().toISOString(),
      status: 'in-progress'
    };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  updateDeployment(id, updates) {
    const deployment = this.deployments.get(id);
    if (deployment) {
      const updated = { ...deployment, ...updates };
      this.deployments.set(id, updated);
      return updated;
    }
    return null;
  }

  // CRUD operations for services
  getAllServices() {
    return Array.from(this.services.values());
  }

  getServiceById(id) {
    return this.services.get(id);
  }

  updateService(id, updates) {
    const service = this.services.get(id);
    if (service) {
      const updated = { ...service, ...updates };
      this.services.set(id, updated);
      return updated;
    }
    return null;
  }

  // Operations for logs
  getAllLogs(limit = 100) {
    const logs = Array.from(this.logs.values());
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  getLogsByService(service, limit = 50) {
    const logs = Array.from(this.logs.values()).filter(log => log.service === service);
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  addLog(log) {
    const id = uuidv4();
    const newLog = {
      id,
      ...log,
      timestamp: new Date().toISOString()
    };
    this.logs.set(id, newLog);
    return newLog;
  }

  // Operations for metrics
  getMetricsByService(service) {
    return this.metrics.get(service) || [];
  }

  getAllMetrics() {
    const result = {};
    for (const [service, metrics] of this.metrics) {
      result[service] = metrics;
    }
    return result;
  }

  // Operations for environments
  getAllEnvironments() {
    return Array.from(this.environments.values());
  }

  getEnvironmentById(id) {
    return this.environments.get(id);
  }

  updateEnvironment(id, updates) {
    const env = this.environments.get(id);
    if (env) {
      const updated = { ...env, ...updates };
      this.environments.set(id, updated);
      return updated;
    }
    return null;
  }
}

// Export singleton instance
module.exports = new InMemoryDB(); 