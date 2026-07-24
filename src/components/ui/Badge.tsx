import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  children,
  className = '',
  dot = false
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-display font-medium border transition-colors';
  
  const variants = {
    primary: 'bg-primary-blue/10 border-primary-blue/20 text-primary-blue',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error',
    info: 'bg-info/10 border-info/20 text-info',
    gray: 'bg-bg-main border-border-subtle text-text-muted'
  };

  const dots = {
    primary: 'bg-primary-blue',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    gray: 'bg-text-muted'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
};
