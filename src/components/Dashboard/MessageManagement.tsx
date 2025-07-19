import { useState, useEffect } from 'react';

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  received_at: string;
  is_read: boolean;
}

function MessageManagement() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = 'https://minimind-backend.onrender.com'; // Replace with your deployed backend URL

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch messages.');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    setError('');
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update the message status in the local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to mark message as read.');
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError('Network error or server is down.');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Message Management</h2>

      {loading && <p>Loading messages...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && messages.length === 0 && (
        <p>No messages found.</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white p-4 rounded-lg shadow-md ${msg.is_read ? 'opacity-70' : 'border-l-4 border-blue-500'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">From: {msg.name} ({msg.email})</h3>
              {!msg.is_read && (
                <button
                  onClick={() => markAsRead(msg.id)}
                  className="bg-primary hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
            {msg.subject && <p className="text-gray-700 mb-1">Subject: {msg.subject}</p>}
            <p className="text-gray-800 mb-2">{msg.message}</p>
            <p className="text-sm text-gray-500">Received: {new Date(msg.received_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageManagement;