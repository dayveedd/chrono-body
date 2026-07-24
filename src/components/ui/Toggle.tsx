import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  className = ''
}) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 bg-border-subtle rounded-full transition-colors duration-200 ${checked ? 'bg-primary-blue' : ''}`} />
        <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm ${checked ? 'transform translate-x-4' : ''}`} />
      </div>
      {label && (
        <span className="text-xs font-display font-medium text-text-primary">
          {label}
        </span>
      )}
    </label>
  );
};
