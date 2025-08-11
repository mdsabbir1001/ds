import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Link } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  initialImageUrl?: string;
  multiple?: boolean; // New prop for multiple file selection
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, initialImageUrl, multiple }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [inputMode, setInputMode] = useState<'file' | 'url'>(initialImageUrl ? 'url' : 'file');
  const [urlInputValue, setUrlInputValue] = useState(initialImageUrl || '');

  useEffect(() => {
    setImageUrl(initialImageUrl || null);
    setUrlInputValue(initialImageUrl || '');
    setInputMode(initialImageUrl ? 'url' : 'file');
  }, [initialImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `public/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error.message);
        // Continue with next file even if one fails
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      // If multiple is true, onUpload will be called for each URL
      // If multiple is false, onUpload will be called only for the last URL (or first if you prefer)
      if (multiple) {
        uploadedUrls.forEach(url => onUpload(url));
      } else {
        setImageUrl(uploadedUrls[0]);
        onUpload(uploadedUrls[0]);
      }
    }
    setUploading(false);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInputValue(url);
    setImageUrl(url);
    onUpload(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setInputMode('file')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            inputMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload Image{multiple ? 's' : ''}
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            inputMode === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Link className="w-4 h-4" /> Use URL
        </button>
      </div>

      {inputMode === 'file' && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          multiple={multiple} // Apply the multiple prop here
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      )}

      {inputMode === 'url' && (
        <input
          type="url"
          placeholder="Enter image URL"
          value={urlInputValue}
          onChange={handleUrlInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}

      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      {imageUrl && !multiple && (
        <div className="mt-2">
          <img src={imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded" />
          <p className="text-sm text-gray-500 break-all mt-1">{imageUrl}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
