import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  loading?: boolean;
  as?: 'button' | 'span';
  children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  className = '',
  children,
  disabled,
  as = 'button',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'fb-btn-secondary';
      case 'danger':
        return 'fb-btn-danger';
      case 'success':
        return 'fb-btn-success';
      default:
        return 'fb-btn';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '17px' };
      default:
        return { padding: '8px 16px', fontSize: '15px' };
    }
  };

  const buttonClass = `${getVariantClass()} ${className}`;
  const buttonStyle = {
    ...getSizeStyle(),
    opacity: (disabled || loading) ? 0.6 : 1,
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    pointerEvents: (disabled || loading) ? 'none' : 'auto'
  };

  const content = (
    <>
      {loading ? (
        <div className="fb-spinner" style={{ marginRight: children ? '8px' : '0' }}></div>
      ) : Icon ? (
        <Icon style={{ width: '16px', height: '16px', marginRight: children ? '8px' : '0' }} />
      ) : null}
      {children}
    </>
  );

  if (as === 'span') {
    return (
      <span className={buttonClass} style={buttonStyle} {...(props as any)}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={buttonClass}
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;