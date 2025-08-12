const express = require('express');
const router = express.Router();
const db = require('../database/inMemoryDB');

// GET /api/monitoring/services - Get all services with their status
router.get('/services', (req, res) => {
  try {
    const services = db.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/monitoring/services/:id - Get specific service
router.get('/services/:id', (req, res) => {
  try {
    const service = db.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// PUT /api/monitoring/services/:id - Update service status/metrics
router.put('/services/:id', (req, res) => {
  try {
    const service = db.updateService(req.params.id, req.body);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// GET /api/monitoring/logs - Get system logs
router.get('/logs', (req, res) => {
  try {
    const { service, limit } = req.query;
    let logs;
    
    if (service) {
      logs = db.getLogsByService(service, parseInt(limit) || 50);
    } else {
      logs = db.getAllLogs(parseInt(limit) || 100);
    }
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /api/monitoring/logs - Add new log entry
router.post('/logs', (req, res) => {
  try {
    const { level, service, message, metadata } = req.body;
    
    if (!level || !service || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: level, service, message' 
      });
    }

    const log = db.addLog({ level, service, message, metadata });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add log entry' });
  }
});

// GET /api/monitoring/metrics - Get system metrics
router.get('/metrics', (req, res) => {
  try {
    const { service } = req.query;
    let metrics;
    
    if (service) {
      metrics = db.getMetricsByService(service);
    } else {
      metrics = db.getAllMetrics();
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// GET /api/monitoring/environments - Get all environments
router.get('/environments', (req, res) => {
  try {
    const environments = db.getAllEnvironments();
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch environments' });
  }
});

// PUT /api/monitoring/environments/:id - Update environment status
router.put('/environments/:id', (req, res) => {
  try {
    const environment = db.updateEnvironment(req.params.id, req.body);
    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update environment' });
  }
});

module.exports = router; 