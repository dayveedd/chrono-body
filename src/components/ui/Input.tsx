import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-display font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-bg-surface border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-blue transition-all ${className} ${error ? 'border-error focus:border-error' : ''}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error font-medium">{error}</span>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-display font-medium text-text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`bg-bg-surface border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-blue transition-all cursor-pointer ${className} ${error ? 'border-error focus:border-error' : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-error font-medium">{error}</span>
      )}
    </div>
  );
};

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueDisplay?: string | number;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  valueDisplay,
  className = '',
  id,
  ...props
}) => {
  const sliderId = id || `slider_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <label htmlFor={sliderId} className="text-xs font-display font-medium text-text-muted">
          {label}
        </label>
        {valueDisplay !== undefined && (
          <span className="text-xs font-mono font-bold text-primary-blue">
            {valueDisplay}
          </span>
        )}
      </div>
      <input
        id={sliderId}
        type="range"
        className={`w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-primary-blue focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
};
