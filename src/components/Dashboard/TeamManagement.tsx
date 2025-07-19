import { useState, useEffect, type FormEvent } from 'react';
import Modal from '../Common/Modal'; // Import the Modal component

const API_URL = 'https://minimind-backend.onrender.com';

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  image_url: string;
}

function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form state for adding new member
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for editing member
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMemberToEdit, setCurrentMemberToEdit] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/team-members`);
      if (!response.ok) {
        throw new Error('Failed to fetch team members.');
      }
      const data: TeamMember[] = await response.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('Processing...');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    if (!imageFile) {
      setError('Please select an image for the team member.');
      return;
    }

    const imageUrl = await uploadImage(imageFile);
    if (!imageUrl) {
      setError('Could not upload image. Please try again.');
      setMessage('');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, designation, image_url: imageUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create team member.');
      }
      
      setMessage('Team member created successfully!');
      // Reset form
      setName('');
      setDesignation('');
      setImageFile(null);
      // Refresh list
      fetchMembers(); 
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleDelete = async (memberId: number) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    setError('');
    setMessage('Deleting...');
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete member.');
      }
      
      setMessage('Member deleted successfully.');
      fetchMembers(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setCurrentMemberToEdit(member);
    setEditName(member.name);
    setEditDesignation(member.designation);
    setEditImageFile(null); // Reset image file for edit
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMemberToEdit) return;

    setError('');
    setMessage('Updating member...');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    let imageUrl = currentMemberToEdit.image_url;
    if (editImageFile) {
      const uploadedUrl = await uploadImage(editImageFile);
      if (!uploadedUrl) {
        setError('Could not upload new image. Please try again.');
        setMessage('');
        return;
      }
      imageUrl = uploadedUrl;
    }

    try {
      const response = await fetch(`${API_URL}/team-members/${currentMemberToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          designation: editDesignation,
          image_url: imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update team member.');
      }
      setMessage('Team member updated successfully!');
      setIsEditModalOpen(false);
      setCurrentMemberToEdit(null);
      fetchMembers(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Team Management</h2>

      {/* Form for creating new team members */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Member</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="designation" className="block text-gray-700 text-sm font-bold mb-2">Designation:</label>
            <input
              type="text"
              id="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="imageFile" className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
            <input
              type="file"
              id="imageFile"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              accept="image/*"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Member'}
          </button>
          {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </form>
      </div>

      {/* Display current team members */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Current Team Members</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="border p-4 rounded-lg text-center">
                <img src={member.image_url} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
                <h4 className="text-lg font-bold">{member.name}</h4>
                <p className="text-gray-600">{member.designation}</p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Team Member"
      >
        {currentMemberToEdit && (
          <form onSubmit={handleUpdateMember}>
            <div className="mb-4">
              <label htmlFor="editName" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                type="text"
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editDesignation" className="block text-gray-700 text-sm font-bold mb-2">Designation:</label>
              <input
                type="text"
                id="editDesignation"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editImageFile" className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
              <input
                type="file"
                id="editImageFile"
                onChange={(e) => setEditImageFile(e.target.files ? e.target.files[0] : null)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                accept="image/*"
              />
              {currentMemberToEdit.image_url && (
                <p className="text-sm text-gray-500 mt-1">Current image: <a href={currentMemberToEdit.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
              )}
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Member'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default TeamManagement;