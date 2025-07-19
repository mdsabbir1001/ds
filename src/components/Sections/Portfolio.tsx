import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase, ExternalLink, Github, Upload, Image, X } from 'lucide-react';
import { type PortfolioItem, type PortfolioCategory } from '../../types';
import { API_URL } from '../../utils/api';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import Header from '../Layout/Header';

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/portfolio-projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items');
      }
      const data: PortfolioItem[] = await response.json();
      setPortfolio(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/portfolio-categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: PortfolioCategory[] = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchCategories();
  }, []);

  const filteredPortfolio = portfolio.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category_name === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSaveItem = async (itemData: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      let response;
      if (editingItem) {
        response = await fetch(`${API_URL}/portfolio-projects/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });
      } else {
        response = await fetch(`${API_URL}/portfolio-projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save portfolio item.');
      }
      fetchPortfolio();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/portfolio-projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete portfolio item.');
        }
        fetchPortfolio();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleAddCategory = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/portfolio-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category.');
      }
      fetchCategories();
      setNewCategory('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/portfolio-categories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete category.');
        }
        fetchCategories();
        fetchPortfolio(); // Refetch portfolio to update items with deleted category
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Portfolio" onSearch={setSearchQuery} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Portfolio</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove portfolio items with multiple project images</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Add Portfolio Item
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Categories</h3>
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>Add Category</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                <span>{category.name}</span>
                <button onClick={() => handleDeleteCategory(category.id)} className="ml-2 text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <p>Loading portfolio items...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPortfolio.map((item) => {
              const projectImages = Array.isArray(item.project_images) ? item.project_images : [];
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="bg-white bg-opacity-90 text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-white bg-opacity-90 text-red-600 hover:text-red-800 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {projectImages.length > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Image className="w-3 h-3 mr-1" />
                          {projectImages.length + 1} images
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {item.category_name}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(Array.isArray(item.technologies) ? item.technologies : []).slice(0, 3).map((tech, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                      {(Array.isArray(item.technologies) ? item.technologies : []).length > 3 && (
                        <span className="text-xs text-gray-500">+{(Array.isArray(item.technologies) ? item.technologies : []).length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View Live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {item.github_url && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900"
                          title="View Code"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredPortfolio.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No portfolio items found</p>
          </div>
        )}
      </div>

      <PortfolioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
      />
    </div>
  );
};

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => void;
  item: PortfolioItem | null;
  categories: PortfolioCategory[];
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_images: [''],
    category_name: '',
    aspect_ratio: '',
    technologies: [''],
    url: '',
    github_url: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        project_images: Array.isArray(item.project_images) && item.project_images.length > 0 ? item.project_images : [''],
        category_name: item.category_name,
        aspect_ratio: item.aspect_ratio || '',
        technologies: Array.isArray(item.technologies) && item.technologies.length > 0 ? item.technologies : [''],
        url: item.url || '',
        github_url: item.github_url || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        project_images: [''],
        category_name: categories.length > 0 ? categories[0].name : '',
        aspect_ratio: '',
        technologies: [''],
        url: '',
        github_url: ''
      });
    }
  }, [item, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      project_images: formData.project_images.filter(img => img.trim() !== ''),
      technologies: formData.technologies.filter(t => t.trim() !== '')
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | `project_images.${number}`) => {
    const file = e.target.files?.[0];
    if (file) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // setError('Authentication required.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${API_URL}/images/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                if (typeof field === 'string' && field === 'image_url') {
                    setFormData(prev => ({ ...prev, image_url: data.url }));
                } else if (typeof field === 'string' && field.startsWith('project_images.')) {
                    const index = parseInt(field.split('.')[1], 10);
                    updateProjectImage(index, data.url);
                }
            }
        })
        .catch(err => {
            console.error('Upload failed', err);
            // setError('Image upload failed.');
        });
    }
};

  const addProjectImage = () => {
    setFormData(prev => ({
      ...prev,
      project_images: [...prev.project_images, '']
    }));
  };

  const removeProjectImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      project_images: prev.project_images.filter((_, i) => i !== index)
    }));
  };

  const updateProjectImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      project_images: prev.project_images.map((img, i) => i === index ? value : img)
    }));
  };

  const addTechnology = () => {
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, '']
    }));
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const updateTechnology = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.map((t, i) => i === index ? value : t)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category_name}
              onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
            >
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image (Main Display Image)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="Enter image URL"
            />
            <input
              type="file"
              id="cover-image"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'image_url')}
            />
            <label htmlFor="cover-image">
              <Button
                variant="secondary"
                icon={Upload}
                size="sm"
                as="span"
                className="cursor-pointer"
              >
                Upload
              </Button>
            </label>
          </div>
          {formData.image_url && (
            <div className="mt-2">
              <img
                src={formData.image_url}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Images (Additional Images)
          </label>
          {formData.project_images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={image}
                onChange={(e) => updateProjectImage(index, e.target.value)}
                placeholder="Enter project image URL"
              />
              <input
                type="file"
                id={`project-image-${index}`}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, `project_images.${index}`)}
              />
              <label htmlFor={`project-image-${index}`}>
                <Button
                  variant="secondary"
                  icon={Upload}
                  size="sm"
                  as="span"
                  className="cursor-pointer"
                >
                  Upload
                </Button>
              </label>
              {formData.project_images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProjectImage(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProjectImage}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Project Image
          </button>
          
          {formData.project_images.some(img => img.trim() !== '') && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Project Images Preview:</p>
              <div className="grid grid-cols-4 gap-2">
                {formData.project_images.filter(img => img.trim() !== '').map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Project preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio (e.g., 16:9, 4:3, 1:1)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.aspect_ratio}
              onChange={(e) => setFormData(prev => ({ ...prev, aspect_ratio: e.target.value }))}
              placeholder="e.g., 16:9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Live URL (Optional)
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub URL (Optional)
          </label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.github_url}
            onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used
          </label>
          {formData.technologies.map((tech, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tech}
                onChange={(e) => updateTechnology(index, e.target.value)}
                placeholder="React, Node.js, etc."
              />
              {formData.technologies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTechnology}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Technology
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update' : 'Add'} Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Portfolio;