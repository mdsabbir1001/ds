import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Star } from 'lucide-react';
import { type Package as PackageType } from '../../types';
import { API_URL } from '../../utils/api';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import Header from '../Layout/Header';

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/packages`);
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data: PackageType[] = await response.json();
      setPackages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePackage = async (packageData: Omit<PackageType, 'id' | 'createdAt'>) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      let response;
      if (editingPackage) {
        response = await fetch(`${API_URL}/packages/${editingPackage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(packageData),
        });
      } else {
        response = await fetch(`${API_URL}/packages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(packageData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save package.');
      }
      fetchPackages();
      setIsModalOpen(false);
      setEditingPackage(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/packages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete package.');
        }
        fetchPackages();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Packages" onSearch={setSearchQuery} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Packages</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove service packages</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            Add Package
          </Button>
        </div>

        {loading ? (
          <p>Loading packages...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => {
              const features = Array.isArray(pkg.features) ? pkg.features : [];
              return (
                <div key={pkg.id} className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                  pkg.popular ? 'border-blue-500' : 'border-gray-200'
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{pkg.title}</h4>
                        <p className="text-2xl font-bold text-blue-600">{pkg.price}</p>
                        <p className="text-sm text-gray-500">{pkg.duration}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  
                  {features.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredPackages.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No packages found</p>
          </div>
        )}
      </div>

      <PackageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(null);
        }}
        onSave={handleSavePackage}
        package={editingPackage}
      />
    </div>
  );
};

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: Omit<PackageType, 'id' | 'createdAt'>) => void;
  package: PackageType | null;
}

const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, onSave, package: pkg }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    features: [''],
    is_popular: false
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        features: Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : [''],
        is_popular: pkg.is_popular
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        features: [''],
        is_popular: false
      });
    }
  }, [pkg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      features: formData.features.filter(f => f.trim() !== '')
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pkg ? 'Edit Package' : 'Add Package'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="$999"
            />
          </div>

          
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.is_popular}
              onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
            />
            <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter feature"
              />
              {formData.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Feature
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {pkg ? 'Update' : 'Add'} Package
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Packages;