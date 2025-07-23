import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Plus, Edit, Trash2, Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'

interface ContactInfo {
  id: number
  email: string
  phone: string
  address: string
  business_hours: string
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

const ContactManager: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    business_hours: '',
    social_links: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      github: ''
    }
  })

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setContactInfo(data)
        setFormData({
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          business_hours: data.business_hours || '',
          social_links: {
            facebook: data.social_links?.facebook || '',
            twitter: data.social_links?.twitter || '',
            linkedin: data.social_links?.linkedin || '',
            instagram: data.social_links?.instagram || '',
            youtube: data.social_links?.youtube || '',
            github: data.social_links?.github || ''
          }
        })
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const dataToSave = {
        ...formData,
        social_links: formData.social_links
      }

      if (contactInfo) {
        const { error } = await supabase
          .from('contact_info')
          .update(dataToSave)
          .eq('id', contactInfo.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert([dataToSave])

        if (error) throw error
      }

      await fetchContactInfo()
      alert('Contact information updated successfully!')
    } catch (error) {
      console.error('Error saving contact info:', error)
      alert('Error saving contact information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [platform]: value
      }
    })
  }

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/yourpage' },
    { key: 'twitter', label: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/yourusername' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/yourprofile' },
    { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/yourusername' },
    { key: 'youtube', label: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/c/yourchannel' },
    { key: 'github', label: 'GitHub', icon: '💻', placeholder: 'https://github.com/yourusername' }
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
        <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Business Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Business Street, City, State 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Business Hours
            </label>
            <textarea
              value={formData.business_hours}
              onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
            />
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">{platform.icon}</span>
                    {platform.label}
                  </label>
                  <input
                    type="url"
                    value={formData.social_links[platform.key]}
                    onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={platform.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Contact Information'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      {contactInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {formData.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a href={`mailto:${formData.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {formData.email}
                    </a>
                  </div>
                </div>
              )}

              {formData.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a href={`tel:${formData.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {formData.phone}
                    </a>
                  </div>
                </div>
              )}

              {formData.address && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{formData.address}</p>
                  </div>
                </div>
              )}

              {formData.business_hours && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{formData.business_hours}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Social Media</h4>
              <div className="space-y-2">
                {socialPlatforms.map((platform) => {
                  const url = formData.social_links[platform.key]
                  if (!url) return null
                  
                  return (
                    <div key={platform.key} className="flex items-center">
                      <span className="mr-3">{platform.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{platform.label}</p>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Visit Profile
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactManager