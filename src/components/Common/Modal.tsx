import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px' };
      case 'lg':
        return { maxWidth: '800px' };
      case 'xl':
        return { maxWidth: '1200px' };
      default:
        return { maxWidth: '600px' };
    }
  };

  return (
    <div className="fb-modal-overlay">
      <div className="fb-modal" style={getSizeStyle()}>
        <div className="fb-modal-header">
          <h3 className="fb-modal-title">{title}</h3>
          <button onClick={onClose} className="fb-modal-close">
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        
        <div className="fb-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;