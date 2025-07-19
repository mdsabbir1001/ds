import React, { useState, useEffect } from 'react';



function ImageManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [altText, setAltText] = useState('');
  const [message, setMessage] = useState('');
  
  const backendUrl = 'https://minimind-backend.onrender.com'; // Replace with your deployed backend URL

  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setImageName(event.target.files[0].name); // Pre-fill name with filename
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedFile) {
      setMessage('Please select a file to upload.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('Authentication required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', imageName);
    if (altText) {
      formData.append('alt_text', altText);
    }

    try {
      const response = await fetch(`${backendUrl}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is automatically set by FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Image uploaded successfully!');
        setSelectedFile(null);
        setImageName('');
        setAltText('');
        // fetchImages(); // Refresh image list
      } else {
        setMessage(data.detail || 'Image upload failed.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Network error or server is down.');
    }
  };

  

  useEffect(() => {
    // fetchImages();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Image Management</h2>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Upload New Image</h3>
        <div className="mb-4">
          <label htmlFor="imageFile" className="block text-gray-700 text-sm font-bold mb-2">Image File:</label>
          <input
            type="file"
            id="imageFile"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="imageName" className="block text-gray-700 text-sm font-bold mb-2">Image Name (optional, defaults to filename):</label>
          <input
            type="text"
            id="imageName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="altText" className="block text-gray-700 text-sm font-bold mb-2">Alt Text (optional):</label>
          <input
            type="text"
            id="altText"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload Image
        </button>
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </form>

      
    </div>
  );
}

export default ImageManagement;