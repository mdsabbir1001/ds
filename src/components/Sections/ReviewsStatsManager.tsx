import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/api';
import { type ReviewsStat } from '../../types';
import Button from '../Common/Button';
import Header from '../Layout/Header';
import { Plus, Trash2 } from 'lucide-react';

const ReviewsStatsManager: React.FC = () => {
  const [stats, setStats] = useState<ReviewsStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reviews-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews stats');
      }
      const data: ReviewsStat[] = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStat = async (stat: ReviewsStat) => {
    setIsSaving(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      setIsSaving(false);
      return;
    }

    try {
      let response;
      if (stat.id) {
        // Update existing stat
        response = await fetch(`${API_URL}/reviews-stats/${stat.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(stat),
        });
      } else {
        // Create new stat
        response = await fetch(`${API_URL}/reviews-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(stat),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save stat.');
      }
      alert('Stat saved successfully!');
      fetchStats(); // Re-fetch to ensure data consistency
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (confirm('Are you sure you want to delete this stat?')) {
      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        setIsSaving(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/reviews-stats/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete stat.');
        }
        alert('Stat deleted successfully!');
        fetchStats(); // Re-fetch to ensure data consistency
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleInputChange = (index: number, field: keyof ReviewsStat, value: string) => {
    const updatedStats = [...stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setStats(updatedStats);
  };

  const addStat = () => {
    setStats([...stats, { id: undefined, number: '', label: '', order: stats.length + 1 }]);
  };

  if (loading) return <p className="p-6">Loading reviews stats...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Reviews Stats" />
      <div className="p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Reviews Statistics</h3>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={stat.id || `new-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={stat.number}
                    onChange={(e) => handleInputChange(index, 'number', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={stat.label}
                    onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={stat.order}
                    onChange={(e) => handleInputChange(index, 'order', e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleSaveStat(stat)} loading={isSaving}>
                    {stat.id ? 'Update' : 'Add'}
                  </Button>
                  {stat.id && (
                    <Button variant="danger" onClick={() => handleDeleteStat(stat.id!)} icon={Trash2}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={addStat} icon={Plus}>
              Add New Stat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsStatsManager;
