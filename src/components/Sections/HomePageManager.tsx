import React, { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import { Plus, Trash2, Upload, Link2 } from 'lucide-react';
import { getFullHomePage, updateFullHomePage, uploadImage, deleteHeroImage, deleteHomeStat, deleteHomeServicePreview } from '../../utils/api';
import { supabase } from '../../utils/supabase';
import { type FullHomePage, type HomePageContent, type HeroImage, type HomeServicePreview } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// --- Interface Definitions ---


interface Stat {
  id?: string;
  number: string;
  label: string;
  icon?: string;
  display_order: number;
}

interface ImageSource {
  id: string | undefined;
  type: 'url' | 'file';
  value: string | File | null;
  preview?: string;
}

interface ServicePreview {
  id: string;
  title: string;
  description?: string;
  image: ImageSource;
  display_order: number;
}

// --- Component ---
const HomePageManager: React.FC = () => {
  // --- State Management ---
  const [heroContent, setHeroContent] = useState<HomePageContent>({
    id: 0,
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    cta_title: '',
    cta_subtitle: '',
  });
  const [heroImages, setHeroImages] = useState<ImageSource[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [servicesPreview, setServicesPreview] = useState<ServicePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: FullHomePage = await getFullHomePage();
        setHeroContent({
          id: data.content.id,
          hero_title: data.content.hero_title || '',
          hero_subtitle: data.content.hero_subtitle || '',
          hero_description: data.content.hero_description || '',
          cta_title: data.content.cta_title || '',
          cta_subtitle: data.content.cta_subtitle || '',
        });
        setHeroImages(data.hero_images.map(img => ({
          id: img.id?.toString(),
          type: 'url',
          value: img.image_url,
          preview: img.image_url,
        })));
        setStats(data.stats.map(stat => ({
          id: stat.id?.toString(),
          number: stat.number,
          label: stat.label,
          icon: stat.icon,
          display_order: stat.display_order,
        })));
        setServicesPreview(data.services_preview.map(service => ({
          id: service.id || uuidv4(),
          title: service.title,
          description: service.description,
          display_order: service.display_order,
          image: {
            id: uuidv4(), // Generate a new UUID for the ImageSource within ServicePreview
            type: 'url',
            value: service.image_url || '',
            preview: service.image_url || '',
          }
        })));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---

  // Generic handler for simple input changes
  const handleInputChange = (name: keyof HomePageContent, value: string) => {
    setHeroContent(prev => ({ ...prev, [name]: value }));
  };

  // Image Source Handlers (for Hero and Services)
  const handleAddImageSource = (setter: React.Dispatch<React.SetStateAction<ImageSource[] | any>>, isServiceImage: boolean = false) => {
    const newImage: ImageSource = { id: uuidv4(), type: 'url', value: '', preview: '' };
    if (isServiceImage) {
        setter((prev: ServicePreview[]) => [...prev, { id: uuidv4(), title: '', description: '', display_order: 0, image: newImage}]);
    } else {
        setter((prev: ImageSource[]) => [...prev, newImage]);
    }
  };

  const handleRemoveImageSource = async (id: string, setter: React.Dispatch<React.SetStateAction<any>>, isNested: boolean = false) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated for deletion.");

      if (isNested) {
        await deleteHomeServicePreview(id, sessionData.session.access_token);
        setter((prev: ServicePreview[]) => prev.filter(item => item.id !== id));
      } else {
        await deleteHeroImage(id, sessionData.session.access_token);
        setter((prev: ImageSource[]) => prev.filter(item => item.id !== id));
      }
      alert('Item deleted successfully!');
    } catch (err: any) {
      setError(err.message);
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  const handleImageSourceChange = (id: string, value: any, setter: React.Dispatch<React.SetStateAction<any>>, field: 'type' | 'value', isNested: boolean = false) => {
      const updateLogic = (item: any) => {
          const imageSource = isNested ? item.image : item;
          if (imageSource.id === id) {
              const updatedImage = { ...imageSource, [field]: value };
              if (field === 'value' && value instanceof File) {
                  updatedImage.preview = URL.createObjectURL(value);
              }
              if (field === 'type' && value === 'url') {
                  updatedImage.value = '';
              }
              return isNested ? { ...item, image: updatedImage } : updatedImage;
          }
          return item;
      };
      setter((prev: any[]) => prev.map(updateLogic));
  };

  // Stats Handlers
  const handleAddStat = () => setStats(prev => [...prev, { id: uuidv4(), number: '', label: '', icon: '', display_order: (prev.length > 0 ? Math.max(...prev.map(s => s.display_order || 0)) : 0) + 1 }]);
  const handleRemoveStat = async (id: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated for deletion.");
      await deleteHomeStat(id, sessionData.session.access_token);
      setStats(prev => prev.filter(stat => stat.id !== id));
      alert('Stat deleted successfully!');
    } catch (err: any) {
      setError(err.message);
      alert(`Failed to delete stat: ${err.message}`);
    }
  };
  const handleStatChange = (id: string, field: keyof Stat, value: string) => {
    setStats(prev => prev.map(stat => stat.id === id ? { ...stat, [field]: value } : stat));
  };
  
  // Service Preview Handlers
  const handleAddServicePreview = () => {
      const newImage: ImageSource = { id: uuidv4(), type: 'url', value: '', preview: '' };
      setServicesPreview(prev => [...prev, { id: uuidv4(), title: '', description: '', display_order: (prev.length > 0 ? Math.max(...prev.map(s => s.display_order || 0)) : 0) + 1, image: newImage}]);
  }
  const handleRemoveServicePreview = async (id: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated for deletion.");
      const success = await deleteHomeServicePreview(id, sessionData.session.access_token);
      if (success) {
        setServicesPreview(prev => prev.filter(s => s.id !== id));
        alert('Service preview deleted successfully!');
      } else {
        throw new Error("Failed to delete service preview from backend.");
      }
    } catch (err: any) {
      setError(err.message);
      alert(`Failed to delete service preview: ${err.message}`);
    }
  };
  const handleServicePreviewChange = (id: string, field: 'title' | 'description' | 'display_order', value: string | number) => {
      setServicesPreview(prev => prev.map(s => s.id === id ? {...s, [field]: value} : s));
  }

  // --- Main Save Logic ---
  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      // Upload new images and update image_url
      const uploadedHeroImages: HeroImage[] = await Promise.all(
        heroImages.map(async (img, index) => {
          let imageUrl = img.value as string;
          if (img.type === 'file' && img.value instanceof File) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) throw new Error("User not authenticated for image upload.");
            const uploadedUrl = await uploadImage(img.value, sessionData.session.access_token);
            if (uploadedUrl) imageUrl = uploadedUrl;
          }
          return { id: img.id || uuidv4(), image_url: imageUrl, display_order: index + 1 };
        })
      );

      const uploadedServicesPreview: HomeServicePreview[] = await Promise.all(
        servicesPreview.map(async (service, index) => {
          let imageUrl = service.image.value as string;
          if (service.image.type === 'file' && service.image.value instanceof File) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) throw new Error("User not authenticated for image upload.");
            const uploadedUrl = await uploadImage(service.image.value, sessionData.session.access_token);
            if (uploadedUrl) imageUrl = uploadedUrl;
          }
          return {
            id: service.id || uuidv4(),
            title: service.title,
            description: service.description,
            image_url: imageUrl,
            display_order: service.display_order || index + 1,
          };
        })
      );

      const homePageData: FullHomePage = {
        content: {
          id: heroContent.id,
          hero_title: heroContent.hero_title,
          hero_subtitle: heroContent.hero_subtitle,
          hero_description: heroContent.hero_description,
          cta_title: heroContent.cta_title,
          cta_subtitle: heroContent.cta_subtitle,
        },
        hero_images: uploadedHeroImages,
        stats: stats.map((stat, index) => ({
          id: stat.id || uuidv4(),
          number: stat.number,
          label: stat.label,
          icon: stat.icon,
          display_order: stat.display_order || index + 1,
        })),
        services_preview: uploadedServicesPreview,
      };

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated for saving home page data.");
      await updateFullHomePage(homePageData, sessionData.session.access_token);
      alert('Home page data saved successfully!');
    } catch (err: any) {
      setError(err.message);
      alert(`Failed to save home page data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading home page data...</p>;
  if (error) return <p className="text-red-500">Error loading data: {error}</p>;

  // --- Render --- 
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Home Page Content" />
      <div className="p-6 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Hero Title" value={heroContent.hero_title || ''} onChange={e => handleInputChange('hero_title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            <textarea placeholder="Hero Subtitle" value={heroContent.hero_subtitle || ''} onChange={e => handleInputChange('hero_subtitle', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={2} />
            <textarea placeholder="Hero Description" value={heroContent.hero_description || ''} onChange={e => handleInputChange('hero_description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
            <div>
              <h4 className="font-medium mb-2">Background Images</h4>
              {heroImages.map(image => <ImageEditor key={image.id!} image={image} onRemove={() => handleRemoveImageSource(image.id!, setHeroImages)} onChange={(field, value) => handleImageSourceChange(image.id!, value, setHeroImages, field)} />)}
              <button onClick={() => handleAddImageSource(setHeroImages)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"><Plus className="w-5 h-5" /><span>Add Image</span></button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Stats Section</h3>
            <div className="space-y-4">
                {stats.map(stat => (
                    <div key={stat.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                        <input type="text" placeholder="Number (e.g., 10+)" value={stat.number} onChange={e => handleStatChange(stat.id!, 'number', e.target.value)} className="px-3 py-2 border rounded-md" />
                        <input type="text" placeholder="Label (e.g., Projects Completed)" value={stat.label} onChange={e => handleStatChange(stat.id!, 'label', e.target.value)} className="px-3 py-2 border rounded-md" />
                        <select value={stat.icon || ''} onChange={e => handleStatChange(stat.id!, 'icon', e.target.value)} className="px-3 py-2 border rounded-md w-full">
                            <option value="">Select Icon</option>
                            <option value="Award">Award</option>
                            <option value="Users">Users</option>
                            <option value="Sparkles">Sparkles</option>
                            <option value="Briefcase">Briefcase</option>
                            <option value="Camera">Camera</option>
                            <option value="Coffee">Coffee</option>
                            <option value="Feather">Feather</option>
                            <option value="Globe">Globe</option>
                            <option value="Heart">Heart</option>
                            <option value="Lightbulb">Lightbulb</option>
                            <option value="MapPin">MapPin</option>
                            <option value="MessageSquare">MessageSquare</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Palette">Palette</option>
                            <option value="PieChart">PieChart</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Settings">Settings</option>
                            <option value="Shield">Shield</option>
                            <option value="Star">Star</option>
                            <option value="Target">Target</option>
                            <option value="TrendingUp">TrendingUp</option>
                            <option value="Zap">Zap</option>
                        </select>
                        <button onClick={() => handleRemoveStat(stat.id!)} className="p-2 text-red-500 hover:bg-red-100 rounded-full self-center justify-self-end"><Trash2 className="w-5 h-5" /></button>
                    </div>
                ))}
            </div>
            <button onClick={() => handleAddStat()} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-4"><Plus className="w-5 h-5" /><span>Add Stat</span></button>
        </div>

        {/* Services Preview Section */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Services Preview</h3>
            <div className="space-y-4">
                {servicesPreview.map(service => (
                    <div key={service.id} className="p-4 border rounded-md space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => handleRemoveServicePreview(service.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        <input type="text" placeholder="Service Title" value={service.title} onChange={e => handleServicePreviewChange(service.id, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        <textarea placeholder="Service Description" value={service.description || ''} onChange={e => handleServicePreviewChange(service.id, 'description', e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={2} />
                        <input type="number" placeholder="Display Order" value={service.display_order} onChange={e => handleServicePreviewChange(service.id, 'display_order', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
                        <h5 className="font-medium">Service Image</h5>
                        <ImageEditor image={service.image} onRemove={() => {}} isNested={true} onChange={(field, value) => handleImageSourceChange(service.image.id!, value, setServicesPreview, field, true)} />
                    </div>
                ))}
            </div>
            <button onClick={handleAddServicePreview} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-4"><Plus className="w-5 h-5" /><span>Add Service Preview</span></button>
        </div>

        {/* CTA Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Call-to-Action (CTA) Section</h3>
          <div className="space-y-4">
            <input type="text" placeholder="CTA Title" value={heroContent.cta_title || ''} onChange={e => handleInputChange('cta_title', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            <input type="text" placeholder="CTA Subtitle" value={heroContent.cta_subtitle || ''} onChange={e => handleInputChange('cta_subtitle', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save All Changes</button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Image Editor Component ---
interface ImageEditorProps {
    image: ImageSource;
    onChange: (field: 'type' | 'value', value: any) => void;
    onRemove: () => void;
    isNested?: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onChange, onRemove, isNested }) => (
    <div className={`p-4 border rounded-md space-y-3 ${isNested ? '' : 'mb-4'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button onClick={() => onChange('type', 'url')} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${image.type === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Link2 size={16}/><span>URL</span></button>
                <button onClick={() => onChange('type', 'file')} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${image.type === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Upload size={16}/><span>Upload</span></button>
            </div>
            {!isNested && <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-5 h-5" /></button>}
        </div>
        
        {image.type === 'url' && (
            <input type="text" placeholder="https://example.com/image.png" value={image.value as string || ''} onChange={(e) => onChange('value', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        )}
        {image.type === 'file' && (
            <input type="file" accept="image/*" onChange={(e) => onChange('value', e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        )}

        {(image.preview || (image.type === 'url' && image.value)) && (
            <div className="mt-2">
                <img src={image.preview || (image.value as string)} alt="Preview" className="w-48 h-24 object-cover rounded-md bg-gray-100"/>
            </div>
        )}
    </div>
);

export default HomePageManager;
