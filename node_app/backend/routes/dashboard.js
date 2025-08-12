const express = require('express');
const router = express.Router();
const db = require('../database/inMemoryDB');

// GET /api/dashboard/overview - Get dashboard overview data
router.get('/overview', (req, res) => {
  try {
    const deployments = db.getAllDeployments();
    const services = db.getAllServices();
    const environments = db.getAllEnvironments();
    const logs = db.getAllLogs(50);

    // Calculate deployment statistics
    const deploymentStats = {
      total: deployments.length,
      successful: deployments.filter(d => d.status === 'success').length,
      failed: deployments.filter(d => d.status === 'failed').length,
      inProgress: deployments.filter(d => d.status === 'in-progress').length
    };

    // Calculate service health
    const serviceHealth = {
      total: services.length,
      healthy: services.filter(s => s.status === 'running').length,
      warning: services.filter(s => s.status === 'warning').length,
      critical: services.filter(s => s.status === 'error' || s.status === 'stopped').length
    };

    // Calculate environment status
    const environmentHealth = {
      total: environments.length,
      healthy: environments.filter(e => e.status === 'healthy').length,
      degraded: environments.filter(e => e.status === 'degraded').length,
      down: environments.filter(e => e.status === 'down').length
    };

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDeployments = deployments.filter(d => 
      new Date(d.startTime) > oneDayAgo
    ).length;

    const recentErrors = logs.filter(log => 
      log.level === 'error' && new Date(log.timestamp) > oneDayAgo
    ).length;

    // System metrics summary
    const avgCpu = services.reduce((sum, s) => sum + (s.cpu || 0), 0) / services.length;
    const avgMemory = services.reduce((sum, s) => sum + (s.memory || 0), 0) / services.length;
    const totalInstances = services.reduce((sum, s) => sum + (s.instances || 0), 0);

    res.json({
      deployments: deploymentStats,
      services: serviceHealth,
      environments: environmentHealth,
      activity: {
        recentDeployments,
        recentErrors,
        totalInstances
      },
      systemMetrics: {
        avgCpu: Math.round(avgCpu),
        avgMemory: Math.round(avgMemory),
        totalInstances
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// GET /api/dashboard/recent-deployments - Get recent deployments
router.get('/recent-deployments', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const deployments = db.getAllDeployments()
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);

    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent deployments' });
  }
});

// GET /api/dashboard/system-health - Get system health summary
router.get('/system-health', (req, res) => {
  try {
    const services = db.getAllServices();
    const environments = db.getAllEnvironments();
    const logs = db.getAllLogs(100);

    // Calculate health scores
    const serviceHealthScore = services.length > 0 
      ? (services.filter(s => s.status === 'running').length / services.length) * 100
      : 100;

    const environmentHealthScore = environments.length > 0
      ? (environments.filter(e => e.status === 'healthy').length / environments.length) * 100
      : 100;

    // Recent error rate
    const recentLogs = logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );
    const errorRate = recentLogs.length > 0
      ? (recentLogs.filter(log => log.level === 'error').length / recentLogs.length) * 100
      : 0;

    // Overall health score
    const overallHealth = Math.round(
      (serviceHealthScore + environmentHealthScore + (100 - errorRate)) / 3
    );

    res.json({
      overallHealth,
      serviceHealthScore: Math.round(serviceHealthScore),
      environmentHealthScore: Math.round(environmentHealthScore),
      errorRate: Math.round(errorRate),
      status: overallHealth > 80 ? 'healthy' : overallHealth > 60 ? 'warning' : 'critical',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

// GET /api/dashboard/deployment-trends - Get deployment trends data
router.get('/deployment-trends', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const deployments = db.getAllDeployments();
    
    // Generate trend data for the last N days
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayDeployments = deployments.filter(d => {
        const deployDate = new Date(d.startTime);
        return deployDate >= date && deployDate < nextDate;
      });
      
      trends.push({
        date: date.toISOString().split('T')[0],
        total: dayDeployments.length,
        successful: dayDeployments.filter(d => d.status === 'success').length,
        failed: dayDeployments.filter(d => d.status === 'failed').length,
        inProgress: dayDeployments.filter(d => d.status === 'in-progress').length
      });
    }
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployment trends' });
  }
});

// GET /api/dashboard/alerts - Get system alerts
router.get('/alerts', (req, res) => {
  try {
    const services = db.getAllServices();
    const environments = db.getAllEnvironments();
    const logs = db.getAllLogs(20);
    
    const alerts = [];
    
    // Service alerts
    services.forEach(service => {
      if (service.status === 'warning' || service.status === 'error') {
        alerts.push({
          id: `service-${service.id}`,
          type: 'service',
          severity: service.status === 'error' ? 'critical' : 'warning',
          title: `Service ${service.name} is ${service.status}`,
          message: `${service.name} requires attention`,
          timestamp: new Date().toISOString(),
          source: service.name
        });
      }
      
      if (service.cpu > 80) {
        alerts.push({
          id: `cpu-${service.id}`,
          type: 'performance',
          severity: 'warning',
          title: `High CPU usage on ${service.name}`,
          message: `CPU usage is at ${service.cpu}%`,
          timestamp: new Date().toISOString(),
          source: service.name
        });
      }
      
      if (service.memory > 85) {
        alerts.push({
          id: `memory-${service.id}`,
          type: 'performance',
          severity: 'warning',
          title: `High memory usage on ${service.name}`,
          message: `Memory usage is at ${service.memory}%`,
          timestamp: new Date().toISOString(),
          source: service.name
        });
      }
    });
    
    // Environment alerts
    environments.forEach(env => {
      if (env.status !== 'healthy') {
        alerts.push({
          id: `env-${env.id}`,
          type: 'environment',
          severity: env.status === 'down' ? 'critical' : 'warning',
          title: `Environment ${env.name} is ${env.status}`,
          message: `${env.name} environment needs attention`,
          timestamp: new Date().toISOString(),
          source: env.name
        });
      }
    });
    
    // Recent error alerts
    const recentErrors = logs.filter(log => 
      log.level === 'error' && 
      new Date(log.timestamp) > new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
    );
    
    recentErrors.forEach(log => {
      alerts.push({
        id: `error-${log.id}`,
        type: 'error',
        severity: 'warning',
        title: `Error in ${log.service}`,
        message: log.message,
        timestamp: log.timestamp,
        source: log.service
      });
    });
    
    // Sort by timestamp (newest first) and limit to 20
    const sortedAlerts = alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    
    res.json(sortedAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router; 