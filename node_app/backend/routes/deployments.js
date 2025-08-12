const express = require('express');
const router = express.Router();
const db = require('../database/inMemoryDB');

// GET /api/deployments - Get all deployments
router.get('/', (req, res) => {
  try {
    const deployments = db.getAllDeployments();
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

// GET /api/deployments/:id - Get specific deployment
router.get('/:id', (req, res) => {
  try {
    const deployment = db.getDeploymentById(req.params.id);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployment' });
  }
});

// POST /api/deployments - Create new deployment
router.post('/', (req, res) => {
  try {
    const { serviceName, version, environment, deployedBy } = req.body;
    
    if (!serviceName || !version || !environment) {
      return res.status(400).json({ 
        error: 'Missing required fields: serviceName, version, environment' 
      });
    }

    const deployment = db.createDeployment({
      serviceName,
      version,
      environment,
      deployedBy: deployedBy || 'system'
    });

    res.status(201).json(deployment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deployment' });
  }
});

// PUT /api/deployments/:id - Update deployment status
router.put('/:id', (req, res) => {
  try {
    const { status, endTime, duration } = req.body;
    const updates = { status };
    
    if (endTime) updates.endTime = endTime;
    if (duration) updates.duration = duration;
    
    const deployment = db.updateDeployment(req.params.id, updates);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deployment' });
  }
});

module.exports = router; 