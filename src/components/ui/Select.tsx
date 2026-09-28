import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, options, error, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-neutral-900 border text-xs text-neutral-100 px-3 py-2 appearance-none transition-colors focus-visible:outline-none focus-visible:border-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-400 cursor-pointer ${
              error ? 'border-rose-700' : 'border-neutral-800'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900 text-neutral-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="text-[11px] text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
