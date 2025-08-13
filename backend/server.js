const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import route handlers
const deploymentRoutes = require('./routes/deployments');
const monitoringRoutes = require('./routes/monitoring');
const simulatorRoutes = require('./routes/simulator');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Log environment info at startup
console.log('🚀 Starting DevOps Dashboard Backend...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${PORT}`);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cts-vibeappea41103-4.azurewebsites.net'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Check if frontend build exists and serve static files in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
console.log(`📁 Looking for frontend build at: ${frontendDistPath}`);

const frontendBuildExists = fs.existsSync(frontendDistPath);
if (frontendBuildExists) {
  console.log('✅ Frontend build found, serving static files');
  app.use(express.static(frontendDistPath));
} else {
  console.warn('⚠️  Frontend build not found! Static files will not be served.');
  console.warn('   Make sure to run "npm run build" in the frontend directory');
}

// API Routes
app.use('/api/deployments', deploymentRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const buildExists = fs.existsSync(frontendDistPath);
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    frontendBuildExists: buildExists,
    frontendBuildPath: frontendDistPath
  });
});

// Serve React app (catch-all for client-side routing)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend build not found',
      message: 'The frontend application has not been built. Please run "npm run build" in the frontend directory.',
      buildPath: frontendDistPath
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - this should be the very last middleware
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DevOps Dashboard Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
});