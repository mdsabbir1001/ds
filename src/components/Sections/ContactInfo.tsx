import React, { useState, useEffect } from 'react';
import { Save, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { type ContactInfo as ContactInfoType } from '../../types';
import { API_URL } from '../../utils/api';
import Button from '../Common/Button';
import Header from '../Layout/Header';

const ContactInfo: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfoType>({
    email: '',
    phone: '',
    address: '',
    businessHours: '',
    socialLinks: {
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: '',
    } as { facebook?: string; linkedin?: string; instagram?: string; twitter?: string; },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contact-info`);
      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }
      const data: ContactInfoType = await response.json();
      setContactInfo({
        ...data,
        socialLinks: data.socialLinks || {},
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/contact-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactInfo),
      });

      if (!response.ok) {
        throw new Error('Failed to save contact information.');
      }
      alert('Contact information saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Contact Information" />
      
      <div className="p-6 max-w-4xl mx-auto">
        {loading && <p>Loading contact information...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Manage Contact Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your business contact details and social media links
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Contact Info */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={contactInfo.businessHours}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, businessHours: e.target.value }))}
                    placeholder="Mon-Fri 9AM-6PM"
                  />
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Facebook className="w-5 h-5 mr-2" />
                  Social Media Links
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.socialLinks.facebook || ''}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                      }))}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                      Twitter
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.socialLinks.twitter || ''}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.socialLinks.linkedin || ''}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={contactInfo.socialLinks.instagram || ''}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  loading={loading}
                  icon={Save}
                >
                  Save Contact Information
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfo;