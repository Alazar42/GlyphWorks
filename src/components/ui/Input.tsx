import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-neutral-900 border text-xs text-neutral-100 placeholder:text-neutral-600 px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:bg-neutral-950 ${
              error ? 'border-rose-700/80 focus-visible:border-rose-500' : 'border-neutral-800'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
