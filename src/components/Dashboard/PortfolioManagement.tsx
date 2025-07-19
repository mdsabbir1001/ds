import { useState, useEffect, type FormEvent } from 'react';
import Modal from '../Common/Modal'; // Import the Modal component

const API_URL = 'https://minimind-backend.onrender.com';

interface PortfolioCategory {
  id: number;
  name: string;
}

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category_id: number;
}

function PortfolioManagement() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Project Form State
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectImageFile, setNewProjectImageFile] = useState<File | null>(null);
  const [newProjectCategoryId, setNewProjectCategoryId] = useState<number | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProjectToEdit, setCurrentProjectToEdit] = useState<PortfolioProject | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectImageFile, setEditProjectImageFile] = useState<File | null>(null);
  const [editProjectCategoryId, setEditProjectCategoryId] = useState<number | ''>('');


  const fetchCategoriesAndProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required to fetch data.');
        setLoading(false);
        return;
      }

      // Fetch Categories
      const categoriesResponse = await fetch(`${API_URL}/portfolio-categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories.');
      }
      const categoriesData: PortfolioCategory[] = await categoriesResponse.json();
      setCategories(categoriesData);

      // Fetch Projects
      const projectsResponse = await fetch(`${API_URL}/portfolio-projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects.');
      }
      const projectsData: PortfolioProject[] = await projectsResponse.json();
      setProjects(projectsData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProjects();
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setMessage('Uploading image...');
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Image upload failed.');
      }
      setMessage('Image uploaded successfully.');
      return data.url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // --- Category Management Handlers ---
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('Adding category...');
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
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add category.');
      }
      setMessage('Category added successfully!');
      setNewCategoryName('');
      fetchCategoriesAndProjects();
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This will not delete associated projects.')) {
      return;
    }

    setError('');
    setMessage('Deleting category...');
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/portfolio-categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete category.');
      }
      setMessage('Category deleted successfully.');
      fetchCategoriesAndProjects();
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  // --- Project Management Handlers ---
  const handleAddProject = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('Adding project...');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    if (!newProjectImageFile) {
      setError('Please select an image for the project.');
      return;
    }
    if (newProjectCategoryId === '') {
      setError('Please select a category for the project.');
      return;
    }

    const imageUrl = await uploadImage(newProjectImageFile);
    if (!imageUrl) {
      setError('Could not upload image. Please try again.');
      setMessage('');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/portfolio-projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDescription,
          image_url: imageUrl,
          category_id: Number(newProjectCategoryId),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add project.');
      }
      setMessage('Project added successfully!');
      // Reset form
      setNewProjectTitle('');
      setNewProjectDescription('');
      setNewProjectImageFile(null);
      setNewProjectCategoryId('');
      // Refresh lists
      fetchCategoriesAndProjects();
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setError('');
    setMessage('Deleting project...');
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/portfolio-projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete project.');
      }
      setMessage('Project deleted successfully.');
      fetchCategoriesAndProjects();
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleEditProject = (project: PortfolioProject) => {
    setCurrentProjectToEdit(project);
    setEditProjectTitle(project.title);
    setEditProjectDescription(project.description);
    setEditProjectCategoryId(project.category_id);
    setEditProjectImageFile(null); // Reset image file for edit
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProjectToEdit) return;

    setError('');
    setMessage('Updating project...');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    let imageUrl = currentProjectToEdit.image_url;
    if (editProjectImageFile) {
      const uploadedUrl = await uploadImage(editProjectImageFile);
      if (!uploadedUrl) {
        setError('Could not upload new image. Please try again.');
        setMessage('');
        return;
      }
      imageUrl = uploadedUrl;
    }

    try {
      const response = await fetch(`${API_URL}/portfolio-projects/${currentProjectToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editProjectTitle,
          description: editProjectDescription,
          image_url: imageUrl,
          category_id: Number(editProjectCategoryId),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update project.');
      }
      setMessage('Project updated successfully!');
      setIsEditModalOpen(false);
      setCurrentProjectToEdit(null);
      fetchCategoriesAndProjects(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  if (loading) return <p>Loading portfolio data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Portfolio Management</h2>

      {/* Category Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Manage Categories</h3>
        <form onSubmit={handleAddCategory} className="mb-4">
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2"
            required
          />
          <button
            type="submit"
            className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Category
          </button>
        </form>
        <ul>
          {categories.map(cat => (
            <li key={cat.id} className="flex justify-between items-center mb-2 p-2 border rounded">
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Project Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Manage Projects</h3>
        <form onSubmit={handleAddProject} className="mb-4">
          <div className="mb-4">
            <label htmlFor="projectTitle" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
            <input
              type="text"
              id="projectTitle"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="projectDescription" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              id="projectDescription"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="projectImage" className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
            <input
              type="file"
              id="projectImage"
              onChange={(e) => setNewProjectImageFile(e.target.files ? e.target.files[0] : null)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              accept="image/*"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="projectCategory" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
            <select
              id="projectCategory"
              value={newProjectCategoryId}
              onChange={(e) => setNewProjectCategoryId(Number(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            >
              <option value="">Select a Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Project'}
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {projects.map(proj => (
            <div key={proj.id} className="border p-4 rounded-lg">
              <img src={proj.image_url} alt={proj.title} className="w-full h-48 object-cover rounded-md mb-2" />
              <h4 className="text-lg font-bold">{proj.title}</h4>
              <p className="text-gray-600 text-sm">Category: {categories.find(c => c.id === proj.category_id)?.name}</p>
              <p className="text-gray-700 text-sm mb-2">{proj.description}</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleEditProject(proj)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        {currentProjectToEdit && (
          <form onSubmit={handleUpdateProject}>
            <div className="mb-4">
              <label htmlFor="editProjectTitle" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
              <input
                type="text"
                id="editProjectTitle"
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editProjectDescription" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
              <textarea
                id="editProjectDescription"
                value={editProjectDescription}
                onChange={(e) => setEditProjectDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-24"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="editProjectImage" className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
              <input
                type="file"
                id="editProjectImage"
                onChange={(e) => setEditProjectImageFile(e.target.files ? e.target.files[0] : null)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                accept="image/*"
              />
              {currentProjectToEdit.image_url && (
                <p className="text-sm text-gray-500 mt-1">Current image: <a href={currentProjectToEdit.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="editProjectCategory" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
              <select
                id="editProjectCategory"
                value={editProjectCategoryId}
                onChange={(e) => setEditProjectCategoryId(Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Project'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default PortfolioManagement;