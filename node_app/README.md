# DevOps Dashboard Application

A comprehensive DevOps dashboard application built with Node.js and React, featuring deployment simulation, system monitoring, and real-time analytics. Perfect for DevOps engineers to visualize and understand deployment workflows.

## 🚀 Features

- **📊 Interactive Dashboard**: Real-time overview of system health, deployments, and metrics
- **🎯 Deployment Simulator**: Step-by-step deployment simulation with real-time logs
- **📈 System Monitoring**: Service health monitoring with performance metrics and charts
- **📋 Deployment Management**: Track and manage application deployments
- **📝 System Logs**: Centralized logging with filtering and search capabilities
- **🔄 Real-time Updates**: Live data refresh and WebSocket support
- **☁️ Azure Ready**: Pre-configured for Azure App Service deployment

## 🏗️ Architecture

```
devops-dashboard-app/
├── backend/                 # Node.js Express API
│   ├── routes/             # API route handlers
│   ├── database/           # In-memory database
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── dist/               # Built frontend (production)
├── web.config              # Azure IIS configuration
├── deploy.cmd              # Azure deployment script
└── package.json            # Root package configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **In-memory database** (Maps for data storage)
- **CORS** and security middleware
- **Rate limiting** and logging
- **WebSocket** support for real-time updates

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API communication

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devops-dashboard-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   This will install dependencies for both backend and frontend.

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both backend (port 3001) and frontend (port 3000) concurrently.

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

### Production Build

```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🌐 Azure App Service Deployment

This application is pre-configured for Azure App Service deployment with the Azure App Service extension.

### Method 1: Using Azure App Service Extension (Recommended)

1. **Install Azure App Service Extension** in VS Code
2. **Sign in to Azure** through the extension
3. **Right-click on your project** and select "Deploy to Web App"
4. **Follow the prompts** to create or select an App Service
5. **Deploy** - The extension will handle the build and deployment process

### Method 2: Manual Azure Deployment

1. **Create Azure App Service**
   ```bash
   az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myDevOpsApp --runtime "node|18-lts"
   ```

2. **Configure deployment**
   ```bash
   az webapp deployment source config --name myDevOpsApp --resource-group myResourceGroup --repo-url <your-repo-url> --branch main --manual-integration
   ```

3. **Set environment variables**
   ```bash
   az webapp config appsettings set --name myDevOpsApp --resource-group myResourceGroup --settings NODE_ENV=production
   ```

### Azure Configuration Files

- **`web.config`**: IIS configuration for Node.js hosting
- **`.deployment`**: Specifies the deployment script
- **`deploy.cmd`**: Custom deployment script that builds both backend and frontend

## 🎮 Usage Guide

### Dashboard Overview
- View system health metrics and alerts
- Monitor deployment trends and statistics
- Check recent deployments and system status
- Real-time performance metrics visualization

### Deployment Simulator
1. **Select a template** (Web App, Microservice, Mobile Backend)
2. **Configure deployment** (service name, version, environment)
3. **Start simulation** to see step-by-step deployment process
4. **Monitor progress** with real-time logs and progress bars
5. **View results** and deployment statistics

### System Monitoring
- **Environment Status**: Monitor dev, staging, and production environments
- **Service Overview**: View all services with CPU/memory usage
- **Performance Metrics**: Real-time charts for CPU, memory, requests, and errors
- **Service Details**: Click on services to view detailed metrics

### Deployment Management
- **View Deployments**: See all deployment history
- **Create Deployments**: Manually trigger new deployments
- **Track Status**: Monitor deployment progress and results
- **Filter & Search**: Find specific deployments quickly

### System Logs
- **Real-time Logs**: View live system logs across all services
- **Advanced Filtering**: Filter by service, log level, and time range
- **Log Analytics**: View error counts and log statistics
- **Export Capabilities**: Download logs for analysis

## 🔧 API Endpoints

### Dashboard APIs
- `GET /api/dashboard/overview` - System overview statistics
- `GET /api/dashboard/system-health` - Overall system health score
- `GET /api/dashboard/recent-deployments` - Recent deployment list
- `GET /api/dashboard/deployment-trends` - Deployment trends data
- `GET /api/dashboard/alerts` - System alerts

### Deployment APIs
- `GET /api/deployments` - List all deployments
- `POST /api/deployments` - Create new deployment
- `GET /api/deployments/:id` - Get specific deployment
- `PUT /api/deployments/:id` - Update deployment status

### Monitoring APIs
- `GET /api/monitoring/services` - List all services
- `GET /api/monitoring/environments` - List environments
- `GET /api/monitoring/logs` - Get system logs
- `GET /api/monitoring/metrics` - Get performance metrics

### Simulator APIs
- `POST /api/simulator/start` - Start deployment simulation
- `GET /api/simulator/status/:id` - Get simulation status
- `GET /api/simulator/logs/:id` - Get simulation logs
- `POST /api/simulator/stop/:id` - Stop simulation
- `GET /api/simulator/templates` - Get deployment templates

## 🔒 Security Features

- **Helmet.js**: Security headers and protection
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## 📊 Monitoring & Observability

- **Health Checks**: Built-in health check endpoints
- **Logging**: Structured logging with different levels
- **Metrics**: Performance and business metrics collection
- **Real-time Updates**: WebSocket support for live data
- **Error Tracking**: Comprehensive error logging and alerting

## 🧪 Development

### Adding New Features

1. **Backend**: Add new routes in `backend/routes/`
2. **Frontend**: Create new pages in `frontend/src/pages/`
3. **API Services**: Update `frontend/src/services/api.js`
4. **Database**: Extend `backend/database/inMemoryDB.js`

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests (if configured)
cd frontend && npm test
```

### Environment Variables

Create `.env` files for different environments:

```env
# Backend .env
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Frontend .env
VITE_API_URL=http://localhost:3001/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3001
   npx kill-port 3001
   ```

2. **Dependencies not installing**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Frontend not connecting to backend**
   - Check if backend is running on port 3001
   - Verify CORS configuration
   - Check network/firewall settings

4. **Azure deployment issues**
   - Ensure Node.js version compatibility
   - Check deployment logs in Azure portal
   - Verify web.config and deploy.cmd files

### Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review Azure App Service logs for deployment issues

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Docker containerization
- [ ] Kubernetes deployment support
- [ ] Advanced alerting and notifications
- [ ] Multi-tenant support
- [ ] API documentation with Swagger
- [ ] Performance optimization
- [ ] Mobile responsive improvements
- [ ] Integration with CI/CD pipelines

---

**Built with ❤️ for DevOps Engineers** 