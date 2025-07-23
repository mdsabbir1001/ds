import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Settings, 
  Users, 
  Briefcase, 
  Star, 
  Mail, 
  ShoppingCart, 
  Image,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Home Content', href: '/admin/home', icon: FileText },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Portfolio', href: '/admin/portfolio', icon: Image },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Packages', href: '/admin/packages', icon: ShoppingCart },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Contact Info', href: '/admin/contact', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar