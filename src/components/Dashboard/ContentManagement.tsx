import React, { useState, useEffect } from 'react';



function ContentManagement() {
  
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState('');
  const backendUrl = 'https://minimind-backend.onrender.com'; // Replace with your deployed backend URL

  

  const handleCreateOrUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('access_token');

    if (!token) {
      setMessage('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/content/${newKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ key: newKey, value: newValue }),
        }
      );

      if (response.status === 404) {
        // If not found, try to create
        const createResponse = await fetch(`${backendUrl}/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ key: newKey, value: newValue }),
        });

        if (createResponse.ok) {
          setMessage('Content created successfully!');
          setNewKey('');
          setNewValue('');
          // fetchContents();
        } else {
          const errorData = await createResponse.json();
          setMessage(errorData.detail || 'Failed to create content.');
        }
      } else if (response.ok) {
        setMessage('Content updated successfully!');
        setNewKey('');
        setNewValue('');
        // fetchContents();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to update content.');
      }
    } catch (error) {
      console.error('Error creating/updating content:', error);
      setMessage('Network error or server is down.');
    }
  };

  useEffect(() => {
    // fetchContents();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Content Management</h2>

      <form onSubmit={handleCreateOrUpdateContent} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Create/Update Content</h3>
        <div className="mb-4">
          <label htmlFor="contentKey" className="block text-gray-700 text-sm font-bold mb-2">Content Key:</label>
          <input
            type="text"
            id="contentKey"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="contentValue" className="block text-gray-700 text-sm font-bold mb-2">Content Value:</label>
          <textarea
            id="contentValue"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Content
        </button>
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </form>

      
    </div>
  );
}

export default ContentManagement;