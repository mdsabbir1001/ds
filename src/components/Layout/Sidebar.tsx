import React from 'react';
import { 
  Home, 
  Globe, 
  Package, 
  Users, 
  Star, 
  Briefcase, 
  Mail, 
  Settings,
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Home Content', icon: Home },
  { id: 'services', label: 'Services', icon: Globe },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'reviews-stats', label: 'Reviews Stats', icon: Star },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'contact', label: 'Contact Info', icon: Settings }
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('access_token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fb-sidebar">
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #dadde1' }}>
        <div className="fb-flex fb-items-center fb-space-x-3">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: '#1877f2', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Settings style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1c1e21' }}>
              Minimind
            </div>
            <div style={{ fontSize: '13px', color: '#65676b' }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`fb-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div style={{ padding: '8px', borderTop: '1px solid #dadde1' }}>
        <div onClick={handleLogout} className="fb-sidebar-item" style={{ color: '#e41e3f' }}>
          <LogOut />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;