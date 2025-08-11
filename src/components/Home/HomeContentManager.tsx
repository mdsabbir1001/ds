import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Plus, Edit, Trash2, Image, BarChart3, Upload } from 'lucide-react'
import ImageUpload from '../Common/ImageUpload'

interface HomeContent {
  id: number
  hero_title: string
  hero_subtitle: string
  hero_description: string
  cta_title: string
  cta_subtitle: string
  updated_at: string
}

interface HeroImage {
  id: number
  image_url: string
  display_order: number
  created_at: string
}

interface HomeStat {
  id: number
  number: string
  label: string
  icon: string
  display_order: number
  created_at: string
}

interface HomeServicePreview {
  id: number
  title: string
  description: string
  image_url: string
  display_order: number
  created_at: string
}

const HomeContentManager: React.FC = () => {
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null)
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [homeStats, setHomeStats] = useState<HomeStat[]>([])
  const [servicesPreviews, setServicesPreviews] = useState<HomeServicePreview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)

  const [contentForm, setContentForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    cta_title: '',
    cta_subtitle: ''
  })

  const [imageForm, setImageForm] = useState({
    image_url: '',
    display_order: 0
  })

  const [statForm, setStatForm] = useState({
    number: '',
    label: '',
    icon: '',
    display_order: 0
  })

  const [servicePreviewForm, setServicePreviewForm] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [contentRes, imagesRes, statsRes, servicesRes] = await Promise.all([
        supabase.from('home_content').select('*').single(),
        supabase.from('hero_images').select('*').order('display_order'),
        supabase.from('home_stats').select('*').order('display_order'),
        supabase.from('home_services_preview').select('*').order('display_order')
      ])

      if (contentRes.data) {
        setHomeContent(contentRes.data)
        setContentForm(contentRes.data)
      }
      
      setHeroImages(imagesRes.data || [])
      setHomeStats(statsRes.data || [])
      setServicesPreviews(servicesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData = {
        hero_title: contentForm.hero_title,
        hero_subtitle: contentForm.hero_subtitle,
        hero_description: contentForm.hero_description,
        cta_title: contentForm.cta_title,
        cta_subtitle: contentForm.cta_subtitle,
      };

      if (homeContent) {
        await supabase
          .from('home_content')
          .update(updateData)
          .eq('id', homeContent.id)
      } else {
        await supabase
          .from('home_content')
          .insert([updateData])
      }
      await fetchAllData()
      alert('Content updated successfully!')
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData = {
        image_url: imageForm.image_url,
        display_order: imageForm.display_order,
      };
      if (editingItem) {
        await supabase
          .from('hero_images')
          .update(updateData)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('hero_images')
          .insert([updateData])
      }
      await fetchAllData()
      setShowModal(false)
      resetForms()
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData = {
        number: statForm.number,
        label: statForm.label,
        icon: statForm.icon,
        display_order: statForm.display_order,
      };
      if (editingItem) {
        await supabase
          .from('home_stats')
          .update(updateData)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('home_stats')
          .insert([updateData])
      }
      await fetchAllData()
      setShowModal(false)
      resetForms()
    } catch (error) {
      console.error('Error saving stat:', error)
    }
  }

  const handleServicePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData = {
        title: servicePreviewForm.title,
        description: servicePreviewForm.description,
        image_url: servicePreviewForm.image_url,
        display_order: servicePreviewForm.display_order,
      };
      if (editingItem) {
        await supabase
          .from('home_services_preview')
          .update(updateData)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('home_services_preview')
          .insert([updateData])
      }
      await fetchAllData()
      setShowModal(false)
      resetForms()
    } catch (error) {
      console.error('Error saving service preview:', error)
    }
  }

  const handleDelete = async (table: string, id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await supabase.from(table).delete().eq('id', id)
        await fetchAllData()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const openModal = (type: string, item?: any) => {
    setModalType(type)
    setEditingItem(item)
    
    if (item) {
      switch (type) {
        case 'image':
          setImageForm(item)
          break
        case 'stat':
          setStatForm(item)
          break
        case 'service':
          setServicePreviewForm(item)
          break
      }
    }
    
    setShowModal(true)
  }

  const resetForms = () => {
    setImageForm({ image_url: '', display_order: 0 })
    setStatForm({ number: '', label: '', icon: '', display_order: 0 })
    setServicePreviewForm({ title: '', description: '', image_url: '', display_order: 0 })
    setEditingItem(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'content', name: 'Hero Content', icon: Edit },
            { id: 'images', name: 'Hero Images', icon: Image },
            { id: 'stats', name: 'Statistics', icon: BarChart3 },
            { id: 'services', name: 'Services Preview', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Hero Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section Content</h3>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={contentForm.hero_title}
                onChange={(e) => setContentForm({ ...contentForm, hero_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={contentForm.hero_subtitle}
                onChange={(e) => setContentForm({ ...contentForm, hero_subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
              <textarea
                value={contentForm.hero_description}
                onChange={(e) => setContentForm({ ...contentForm, hero_description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                <input
                  type="text"
                  value={contentForm.cta_title}
                  onChange={(e) => setContentForm({ ...contentForm, cta_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Subtitle</label>
                <input
                  type="text"
                  value={contentForm.cta_subtitle}
                  onChange={(e) => setContentForm({ ...contentForm, cta_subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Content
            </button>
          </form>
        </div>
      )}

      {/* Hero Images Tab */}
      {activeTab === 'images' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Hero Images</h3>
              <button
                onClick={() => openModal('image')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Image
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heroImages.map((image) => (
                  <tr key={image.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={image.image_url} alt="Hero" className="h-16 w-24 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{image.display_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal('image', image)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('hero_images', image.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Home Statistics</h3>
              <button
                onClick={() => openModal('stat')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Statistic
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {homeStats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.label}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.icon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.display_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal('stat', stat)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('home_stats', stat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Preview Tab */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Services Preview</h3>
              <button
                onClick={() => openModal('service')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Service Preview
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicesPreviews.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={service.image_url} alt={service.title} className="h-10 w-10 rounded object-cover" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.title}</div>
                          <div className="text-sm text-gray-500">{service.description?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.display_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal('service', service)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('home_services_preview', service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'image' ? 'Image' : modalType === 'stat' ? 'Statistic' : 'Service Preview'}
              </h3>
              
              {modalType === 'image' && (
                <form onSubmit={handleImageSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <ImageUpload
                      initialImageUrl={imageForm.image_url}
                      onUpload={(url) => setImageForm({ ...imageForm, image_url: url })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={imageForm.display_order}
                      onChange={(e) => setImageForm({ ...imageForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'stat' && (
                <form onSubmit={handleStatSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                    <input
                      type="text"
                      value={statForm.number}
                      onChange={(e) => setStatForm({ ...statForm, number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={statForm.label}
                      onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select
                      value={statForm.icon}
                      onChange={(e) => setStatForm({ ...statForm, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select an icon</option>
                      {["Award", "Users", "Sparkles"].map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={statForm.display_order}
                      onChange={(e) => setStatForm({ ...statForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'service' && (
                <form onSubmit={handleServicePreviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={servicePreviewForm.title}
                      onChange={(e) => setServicePreviewForm({ ...servicePreviewForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={servicePreviewForm.description}
                      onChange={(e) => setServicePreviewForm({ ...servicePreviewForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <ImageUpload
                      initialImageUrl={servicePreviewForm.image_url}
                      onUpload={(url) => setServicePreviewForm({ ...servicePreviewForm, image_url: url })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={servicePreviewForm.display_order}
                      onChange={(e) => setServicePreviewForm({ ...servicePreviewForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeContentManager