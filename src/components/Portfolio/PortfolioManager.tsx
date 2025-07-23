import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, Search, Tag, ExternalLink, Github } from 'lucide-react'

interface PortfolioCategory {
  id: number
  name: string
  created_at: string
}

interface PortfolioProject {
  id: number
  title: string
  description: string
  image_url: string
  category_id: number
  project_images: string[]
  url: string
  github_url: string
  technologies: string[]
  aspect_ratio: string
  created_at: string
  portfolio_categories?: PortfolioCategory
}

const PortfolioManager: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('project')
  const [editingItem, setEditingItem] = useState<any>(null)

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category_id: '',
    project_images: [''],
    url: '',
    github_url: '',
    technologies: [''],
    aspect_ratio: 'landscape'
  })

  const [categoryForm, setCategoryForm] = useState({
    name: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        supabase
          .from('portfolio_projects')
          .select(`
            *,
            portfolio_categories (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('portfolio_categories')
          .select('*')
          .order('name')
      ])

      setProjects(projectsRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const projectData = {
        ...projectForm,
        category_id: parseInt(projectForm.category_id),
        project_images: projectForm.project_images.filter(img => img.trim() !== ''),
        technologies: projectForm.technologies.filter(tech => tech.trim() !== '')
      }

      if (editingItem) {
        await supabase
          .from('portfolio_projects')
          .update(projectData)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('portfolio_projects')
          .insert([projectData])
      }

      await fetchData()
      resetForms()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        await supabase
          .from('portfolio_categories')
          .update(categoryForm)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('portfolio_categories')
          .insert([categoryForm])
      }

      await fetchData()
      resetForms()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (table: string, id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await supabase.from(table).delete().eq('id', id)
        await fetchData()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const openModal = (type: string, item?: any) => {
    setModalType(type)
    setEditingItem(item)
    
    if (item) {
      if (type === 'project') {
        setProjectForm({
          ...item,
          category_id: item.category_id?.toString() || '',
          project_images: item.project_images || [''],
          technologies: item.technologies || ['']
        })
      } else if (type === 'category') {
        setCategoryForm(item)
      }
    }
    
    setShowModal(true)
  }

  const resetForms = () => {
    setProjectForm({
      title: '',
      description: '',
      image_url: '',
      category_id: '',
      project_images: [''],
      url: '',
      github_url: '',
      technologies: [''],
      aspect_ratio: 'landscape'
    })
    setCategoryForm({ name: '' })
    setEditingItem(null)
  }

  const addArrayField = (field: 'project_images' | 'technologies') => {
    setProjectForm({
      ...projectForm,
      [field]: [...projectForm[field], '']
    })
  }

  const updateArrayField = (field: 'project_images' | 'technologies', index: number, value: string) => {
    const newArray = [...projectForm[field]]
    newArray[index] = value
    setProjectForm({
      ...projectForm,
      [field]: newArray
    })
  }

  const removeArrayField = (field: 'project_images' | 'technologies', index: number) => {
    const newArray = projectForm[field].filter((_, i) => i !== index)
    setProjectForm({
      ...projectForm,
      [field]: newArray
    })
  }

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('category')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Tag className="w-5 h-5" />
            Add Category
          </button>
          <button
            onClick={() => openModal('project')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <span className="text-sm text-gray-700">{category.name}</span>
              <button
                onClick={() => openModal('category', category)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete('portfolio_categories', category.id)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technologies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded object-cover"
                          src={project.image_url}
                          alt={project.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-500">{project.description?.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {project.portfolio_categories?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.technologies?.slice(0, 2).join(', ')}
                    {project.technologies?.length > 2 && '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal('project', project)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('portfolio_projects', project.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'project' ? 'Project' : 'Category'}
              </h3>
              
              {modalType === 'project' ? (
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={projectForm.category_id}
                        onChange={(e) => setProjectForm({ ...projectForm, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                      <select
                        value={projectForm.aspect_ratio}
                        onChange={(e) => setProjectForm({ ...projectForm, aspect_ratio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                    <input
                      type="url"
                      value={projectForm.image_url}
                      onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                      <input
                        type="url"
                        value={projectForm.url}
                        onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={projectForm.github_url}
                        onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Images</label>
                    {projectForm.project_images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateArrayField('project_images', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Image URL"
                        />
                        {projectForm.project_images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('project_images', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('project_images')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Image
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
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
              ) : (
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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

export default PortfolioManager