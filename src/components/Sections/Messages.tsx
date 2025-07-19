import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Reply } from 'lucide-react';
import { type ContactMessage } from '../../types';
import { API_URL } from '../../utils/api';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import Header from '../Layout/Header';

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data: ContactMessage[] = await response.json();
      const processedData = data.map(msg => {
        return { ...msg, id: msg.id || '' };
      });
      setMessages(processedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'read' && message.read) ||
                         (filterStatus === 'unread' && !message.read);
    
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/messages/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read.');
      }
      fetchMessages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete message.');
        }
        fetchMessages();
        setSelectedMessages(selectedMessages.filter(msgId => msgId !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedMessages.length} selected messages?`)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required.');
        return;
      }

      try {
        // Assuming a bulk delete endpoint or iterating through selected messages
        await Promise.all(selectedMessages.map(id => 
          fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        ));
        fetchMessages();
        setSelectedMessages([]);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  const handleSendReply = async (recipientEmail: string, subject: string, body: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication required.');
    }

    try {
      const response = await fetch(`${API_URL}/messages/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient_email: recipientEmail, subject, body }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply.');
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Messages" onSearch={setSearchQuery} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contact Messages</h3>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {selectedMessages.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="danger"
                size="sm"
                icon={Trash2}
              >
                Delete Selected ({selectedMessages.length})
              </Button>
            )}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'read' | 'unread')}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              <div>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Select All ({filteredMessages.length})
                    </span>
                  </label>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !message.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedMessages.includes(message.id)}
                          onChange={() => handleSelectMessage(message.id)}
                        />
                        
                        <div className="flex-shrink-0 mt-1">
                          {message.read ? (
                            <MailOpen className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Mail className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleViewMessage(message)}
                        >
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {message.email}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${!message.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(message.received_at).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${message.email}?subject=Re: ${message.subject}`;
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        onSendReply={handleSendReply}
      />
    </div>
  );
};

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onSendReply: (recipientEmail: string, subject: string, body: string) => Promise<void>;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, message, onSendReply }) => {
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const messageTemplates = [
    {
      name: 'Thank You',
      subject: 'Thank you for your message!',
      body: 'Dear [Name],\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\n[Your Company Name]',
    },
    {
      name: 'Project Inquiry',
      subject: 'Regarding your project inquiry',
      body: 'Dear [Name],\n\nThank you for your interest in our services. Could you please provide more details about your project requirements?\n\nLooking forward to hearing from you,\n[Your Company Name]',
    },
    {
      name: 'General Inquiry',
      subject: 'Regarding your inquiry',
      body: 'Dear [Name],\n\nThank you for your message. We are reviewing your inquiry and will respond as soon as possible.\n\nBest regards,\n[Your Company Name]',
    },
  ];

  useEffect(() => {
    if (message) {
      setReplySubject(`Re: ${message.subject || ''}`);
      setReplyBody(`Dear ${message.name || ''},\n\n---\nOriginal Message:\n` + message.message);
    }
  }, [message]);

  if (!message) return null;

  const handleSendReply = async () => {
    setIsReplying(true);
    try {
      await onSendReply(message.email, replySubject, replyBody);
      alert('Reply sent successfully!');
      onClose();
    } catch (error: any) {
      alert(`Failed to send reply: ${error.message}`);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setReplySubject(''); // Clear subject on close
        setReplyBody(''); // Clear body on close
      }}
      title="Message Details"
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-sm text-gray-900">{message.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">{message.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <p className="text-sm text-gray-900">{message.subject}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Received
          </label>
          <p className="text-sm text-gray-600">
            {new Date(message.received_at).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Reply to Message</h4>
          <div className="mb-4">
            <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-1">
              Use Template
            </label>
            <select
              id="messageTemplate"
              className="mt-1 block w-full rounded-md border-2 border-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
              onChange={(e) => {
                const selectedTemplate = messageTemplates.find(t => t.name === e.target.value);
                if (selectedTemplate) {
                  setReplySubject(selectedTemplate.subject.replace('[Name]', message?.name || ''));
                  setReplyBody(selectedTemplate.body.replace('[Name]', message?.name || '') + '\n\n---\nOriginal Message:\n' + message?.message);
                }
              }}
            >
              <option value="">Select a template</option>
              {messageTemplates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="replySubject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="replySubject"
                className="mt-1 block w-full rounded-md border-2 border-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="replyBody" className="block text-sm font-medium text-gray-700 mb-1">
                Reply Message
              </label>
              <textarea
                id="replyBody"
                rows={5}
                className="mt-1 block w-full rounded-md border-2 border-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSendReply} disabled={isReplying} icon={Reply}>
                {isReplying ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Messages;