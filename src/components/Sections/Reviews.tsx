import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, CheckCircle, XCircle, Upload } from 'lucide-react';
import { type Review } from '../../types';
import { API_URL } from '../../utils/api';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import Header from '../Layout/Header';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data: Review[] = await response.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'approved' && review.approved) ||
                         (filterStatus === 'pending' && !review.approved);
    
    return matchesSearch && matchesFilter;
  });

  const handleSaveReview = async (reviewData: Omit<Review, 'created_at'>) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      let response;
      const dataToSend = { ...reviewData }; // Create a mutable copy

      if (editingReview && editingReview.id) {
        const { id, ...dataToSend } = reviewData;
        response = await fetch(`${API_URL}/reviews/${editingReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        response = await fetch(`${API_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save review.');
      }
      fetchReviews();
      setIsModalOpen(false);
      setEditingReview(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/reviews/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete review.');
        }
        fetchReviews();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approved: !currentStatus }), // This body might not be needed if endpoint just toggles
      });

      if (!response.ok) {
        throw new Error('Failed to update review approval status.');
      }
      fetchReviews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Reviews" onSearch={setSearchQuery} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Reviews</h3>
            <p className="text-sm text-gray-600">Add, edit, or moderate customer reviews</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending')}
            >
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Add Review
            </Button>
          </div>
        </div>

        {loading ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={review.image_url}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.designation}</p>
                      {review.company_url ? (
                        <a href={review.company_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {review.company}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600">{review.company}</p>
                      )}
                      <p className="text-sm text-gray-600">Project: {review.project}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleApproval(review.id!, review.approved)}
                      className={`${review.approved ? 'text-green-600' : 'text-gray-400'} hover:text-green-800`}
                      title={review.approved ? 'Approved' : 'Pending approval'}
                    >
                      {review.approved ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingReview(review);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{review.review}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredReviews.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReview(null);
        }}
        onSave={handleSaveReview}
        review={editingReview}
      />
    </div>
  );
};

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Omit<Review, 'created_at'>) => void;
  review: Review | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSave, review }) => {
  const [formData, setFormData] = useState({
    id: review?.id || 0,
    name: '',
    designation: '',
    company: '',
    company_url: '',
    project: '',
    rating: 5,
    review: '',
    image_url: '',
    approved: false,
  });

  useEffect(() => {
    if (review) {
      setFormData({
        id: review.id,
        name: review.name || '',
        designation: review.designation || '',
        company: review.company || '',
        company_url: review.company_url || '',
        project: review.project || '',
        rating: review.rating || 5,
        review: review.review || '',
        image_url: review.image_url || '',
        approved: review.approved || false,
      });
    } else {
      setFormData({
        id: 0,
        name: '',
        designation: '',
        company: '',
        company_url: '',
        project: '',
        rating: 5,
        review: '',
        image_url: '',
        approved: false,
      });
    }
  }, [review]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={review ? 'Edit Review' : 'Add Review'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company URL
            </label>
            <input
              type="url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.company_url}
              onChange={(e) => setFormData(prev => ({ ...prev, company_url: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.project}
            onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.rating}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
          >
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review
          </label>
          <textarea
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={formData.review}
            onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image URL
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="url"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="Enter image URL or upload"
            />
            <input
              type="file"
              id="review-image"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const token = localStorage.getItem('access_token');
                  if (!token) {
                    alert('Authentication required to upload image.');
                    return;
                  }
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
                    if (!response.ok) {
                      throw new Error('Image upload failed.');
                    }
                    const data = await response.json();
                    setFormData(prev => ({ ...prev, image_url: data.url }));
                  } catch (error: any) {
                    alert(`Image upload error: ${error.message}`);
                  }
                }
              }}
            />
            <label htmlFor="review-image">
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
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.approved}
              onChange={(e) => setFormData(prev => ({ ...prev, approved: e.target.checked }))}
            />
            <span className="ml-2 text-sm text-gray-700">Approve this review</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {review ? 'Update' : 'Add'} Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Reviews;