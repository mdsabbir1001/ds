import React from 'react'
import { Menu } from 'lucide-react'

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void
  title: string
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, title }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900 lg:ml-0">
            {title}
          </h1>
        </div>
      </div>
    </header>
  )
}

export default Header