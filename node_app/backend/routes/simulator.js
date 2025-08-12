const express = require('express');
const router = express.Router();
const db = require('../database/inMemoryDB');

// Deployment simulation steps
const DEPLOYMENT_STEPS = [
  { name: 'Initializing', duration: 2000, success: 95 },
  { name: 'Building Application', duration: 8000, success: 90 },
  { name: 'Running Tests', duration: 5000, success: 85 },
  { name: 'Creating Docker Image', duration: 6000, success: 92 },
  { name: 'Pushing to Registry', duration: 4000, success: 88 },
  { name: 'Deploying to Environment', duration: 7000, success: 93 },
  { name: 'Health Checks', duration: 3000, success: 90 },
  { name: 'Finalizing', duration: 2000, success: 98 }
];

// Store active simulations
const activeSimulations = new Map();

// POST /api/simulator/start - Start deployment simulation
router.post('/start', async (req, res) => {
  try {
    const { serviceName, version, environment, deployedBy } = req.body;
    
    if (!serviceName || !version || !environment) {
      return res.status(400).json({ 
        error: 'Missing required fields: serviceName, version, environment' 
      });
    }

    // Create deployment record
    const deployment = db.createDeployment({
      serviceName,
      version,
      environment,
      deployedBy: deployedBy || 'simulator'
    });

    // Start simulation
    const simulation = {
      deploymentId: deployment.id,
      currentStep: 0,
      status: 'running',
      logs: [],
      startTime: Date.now()
    };

    activeSimulations.set(deployment.id, simulation);

    // Run simulation asynchronously
    runSimulation(deployment.id, simulation);

    res.json({
      deploymentId: deployment.id,
      status: 'started',
      totalSteps: DEPLOYMENT_STEPS.length
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to start simulation' });
  }
});

// GET /api/simulator/status/:deploymentId - Get simulation status
router.get('/status/:deploymentId', (req, res) => {
  try {
    const simulation = activeSimulations.get(req.params.deploymentId);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const currentStepInfo = simulation.currentStep < DEPLOYMENT_STEPS.length 
      ? DEPLOYMENT_STEPS[simulation.currentStep] 
      : null;

    res.json({
      deploymentId: req.params.deploymentId,
      status: simulation.status,
      currentStep: simulation.currentStep,
      totalSteps: DEPLOYMENT_STEPS.length,
      currentStepName: currentStepInfo?.name || 'Completed',
      logs: simulation.logs,
      progress: Math.round((simulation.currentStep / DEPLOYMENT_STEPS.length) * 100)
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get simulation status' });
  }
});

// GET /api/simulator/logs/:deploymentId - Get simulation logs
router.get('/logs/:deploymentId', (req, res) => {
  try {
    const simulation = activeSimulations.get(req.params.deploymentId);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json({ logs: simulation.logs });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get simulation logs' });
  }
});

// POST /api/simulator/stop/:deploymentId - Stop simulation
router.post('/stop/:deploymentId', (req, res) => {
  try {
    const simulation = activeSimulations.get(req.params.deploymentId);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    simulation.status = 'cancelled';
    
    // Update deployment status
    db.updateDeployment(req.params.deploymentId, {
      status: 'cancelled',
      endTime: new Date().toISOString(),
      duration: Math.round((Date.now() - simulation.startTime) / 1000)
    });

    res.json({ status: 'cancelled' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to stop simulation' });
  }
});

// GET /api/simulator/templates - Get deployment templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'Standard web application deployment',
      services: ['Frontend', 'Backend', 'Database'],
      environments: ['Development', 'Staging', 'Production']
    },
    {
      id: 'microservice',
      name: 'Microservice',
      description: 'Individual microservice deployment',
      services: ['User Service', 'Payment Service', 'Notification Service'],
      environments: ['Development', 'Staging', 'Production']
    },
    {
      id: 'mobile-backend',
      name: 'Mobile Backend',
      description: 'Mobile application backend services',
      services: ['API Gateway', 'Auth Service', 'Push Notifications'],
      environments: ['Development', 'Staging', 'Production']
    }
  ];

  res.json(templates);
});

// Async function to run the simulation
async function runSimulation(deploymentId, simulation) {
  try {
    for (let i = 0; i < DEPLOYMENT_STEPS.length; i++) {
      if (simulation.status === 'cancelled') {
        break;
      }

      const step = DEPLOYMENT_STEPS[i];
      simulation.currentStep = i;
      
      // Add log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Starting ${step.name}...`
      };
      simulation.logs.push(logEntry);

      // Simulate step duration
      await new Promise(resolve => setTimeout(resolve, step.duration));

      // Simulate potential failure
      const success = Math.random() * 100 < step.success;
      
      if (!success && Math.random() < 0.1) { // 10% chance of failure if step fails
        simulation.status = 'failed';
        simulation.logs.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `${step.name} failed: Simulated error occurred`
        });

        db.updateDeployment(deploymentId, {
          status: 'failed',
          endTime: new Date().toISOString(),
          duration: Math.round((Date.now() - simulation.startTime) / 1000)
        });

        return;
      }

      // Success log
      simulation.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `${step.name} completed successfully`
      });
    }

    // Complete simulation
    if (simulation.status !== 'cancelled') {
      simulation.status = 'completed';
      simulation.currentStep = DEPLOYMENT_STEPS.length;
      
      db.updateDeployment(deploymentId, {
        status: 'success',
        endTime: new Date().toISOString(),
        duration: Math.round((Date.now() - simulation.startTime) / 1000)
      });

      simulation.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Deployment completed successfully!'
      });
    }

  } catch (error) {
    console.error('Simulation error:', error);
    simulation.status = 'failed';
    
    db.updateDeployment(deploymentId, {
      status: 'failed',
      endTime: new Date().toISOString(),
      duration: Math.round((Date.now() - simulation.startTime) / 1000)
    });
  }
}

module.exports = router; 