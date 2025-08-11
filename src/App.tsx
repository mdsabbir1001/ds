import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import AdminLayout from './components/Layout/AdminLayout'
import Dashboard from './components/Dashboard/Dashboard'
import ServicesManager from './components/Services/ServicesManager'
import HomeContentManager from './components/Home/HomeContentManager'
import PortfolioManager from './components/Portfolio/PortfolioManager'
import TeamManager from './components/Team/TeamManager'
import ReviewsManager from './components/Reviews/ReviewsManager'
import PackagesManager from './components/Packages/PackagesManager'
import OrdersManager from './components/Orders/OrdersManager'
import MessagesManager from './components/Messages/MessagesManager'
import ContactManager from './components/Contact/ContactManager'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

const LoginRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <Navigate to="/admin" /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="home" element={<HomeContentManager />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="team" element={<TeamManager />} />
            <Route path="reviews" element={<ReviewsManager />} />
            <Route path="packages" element={<PackagesManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="messages" element={<MessagesManager />} />
            <Route path="contact" element={<ContactManager />} />
          </Route>
          <Route path="/" element={<Navigate to="/admin" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App