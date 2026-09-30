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
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white dark:bg-neutral-900 border text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-sky-500 dark:focus-visible:border-neutral-400 focus-visible:ring-1 focus-visible:ring-sky-500 dark:focus-visible:ring-neutral-400 disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 rounded-xs ${
              error ? 'border-rose-600 focus-visible:border-rose-500' : 'border-neutral-300 dark:border-neutral-800'
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
