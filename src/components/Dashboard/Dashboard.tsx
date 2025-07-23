import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Star, ShoppingCart, Mail, TrendingUp, Eye } from 'lucide-react'

interface Stats {
  totalServices: number
  totalProjects: number
  totalReviews: number
  totalOrders: number
  totalMessages: number
  totalTeamMembers: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    totalProjects: 0,
    totalReviews: 0,
    totalOrders: 0,
    totalMessages: 0,
    totalTeamMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [
        { count: servicesCount },
        { count: projectsCount },
        { count: reviewsCount },
        { count: ordersCount },
        { count: messagesCount },
        { count: teamCount },
      ] = await Promise.all([
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio_projects').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        totalServices: servicesCount || 0,
        totalProjects: projectsCount || 0,
        totalReviews: reviewsCount || 0,
        totalOrders: ordersCount || 0,
        totalMessages: messagesCount || 0,
        totalTeamMembers: teamCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      title: 'Portfolio Projects',
      value: stats.totalProjects,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      title: 'Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Messages',
      value: stats.totalMessages,
      icon: Mail,
      color: 'bg-red-500',
    },
    {
      title: 'Team Members',
      value: stats.totalTeamMembers,
      icon: Users,
      color: 'bg-indigo-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-gray-600">
          Manage your website content, monitor activity, and handle customer interactions from this central dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="font-medium">Add New Service</span>
              <p className="text-sm text-gray-600">Create a new service offering</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="font-medium">Add Portfolio Project</span>
              <p className="text-sm text-gray-600">Showcase your latest work</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="font-medium">Update Home Content</span>
              <p className="text-sm text-gray-600">Modify hero section and stats</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Website content updated</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>New order received</span>
              <span className="text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Review approved</span>
              <span className="text-gray-500">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard