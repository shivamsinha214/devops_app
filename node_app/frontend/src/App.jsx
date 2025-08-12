import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Deployments from './pages/Deployments'
import Monitoring from './pages/Monitoring'
import Simulator from './pages/Simulator'
import Logs from './pages/Logs'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Layout>
  )
}

export default App 