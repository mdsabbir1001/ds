import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    const titles: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/home': 'Home Content',
      '/admin/services': 'Services',
      '/admin/portfolio': 'Portfolio',
      '/admin/team': 'Team Members',
      '/admin/reviews': 'Reviews',
      '/admin/packages': 'Packages',
      '/admin/orders': 'Orders',
      '/admin/messages': 'Messages',
      '/admin/contact': 'Contact Information',
    }
    return titles[path] || 'Admin Panel'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header setIsSidebarOpen={setIsSidebarOpen} title={getPageTitle()} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout