import React from 'react';
import { Bell, User, Search, Calendar, Clock } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onSearch }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fb-header">
      <div className="fb-flex fb-items-center fb-space-x-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1c1e21', marginBottom: '4px' }}>
            {title}
          </h1>
          <div className="fb-flex fb-items-center fb-space-x-4">
            <div className="fb-flex fb-items-center fb-text-small fb-text-muted">
              <Calendar style={{ width: '14px', height: '14px', marginRight: '4px' }} />
              {currentDate}
            </div>
            <div className="fb-flex fb-items-center fb-text-small fb-text-muted">
              <Clock style={{ width: '14px', height: '14px', marginRight: '4px' }} />
              {currentTime}
            </div>
          </div>
        </div>
      </div>
      
      <div className="fb-flex fb-items-center fb-space-x-3">
        {onSearch && (
          <div className="fb-search">
            <Search />
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        
        <button style={{
          background: '#f0f2f5',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <Bell style={{ width: '20px', height: '20px', color: '#65676b' }} />
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            background: '#e41e3f',
            borderRadius: '50%'
          }}></div>
        </button>
        
        <button style={{
          background: '#f0f2f5',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <User style={{ width: '20px', height: '20px', color: '#65676b' }} />
        </button>
      </div>
    </div>
  );
};

export default Header;