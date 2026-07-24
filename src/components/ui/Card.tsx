import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'borderless';
  glow?: boolean;
  glowColor?: 'blue' | 'cyan' | 'indigo' | 'success' | 'warning' | 'error';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  glow = false,
  glowColor = 'blue',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-lg p-5 transition-all duration-300';
  
  const variants = {
    default: 'bg-bg-surface border border-border-subtle shadow-sm',
    glass: 'glass-card',
    borderless: 'bg-transparent border-0 shadow-none'
  };

  const glows = {
    blue: 'border-primary-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    cyan: 'border-accent-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    indigo: 'border-accent-indigo/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    success: 'border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    warning: 'border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    error: 'border-error/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
  };

  const hoverStyle = hoverable 
    ? 'hover:scale-[1.01] hover:border-primary-blue/50 cursor-pointer' 
    : '';

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${glow ? glows[glowColor] : ''} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
