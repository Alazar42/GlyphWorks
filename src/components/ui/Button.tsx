import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-40 rounded-none cursor-pointer';

    const variants = {
      primary: 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300 font-medium',
      secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700',
      outline: 'bg-transparent text-neutral-200 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 active:bg-neutral-850',
      ghost: 'bg-transparent text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 active:bg-neutral-800',
      destructive: 'bg-rose-950/80 text-rose-200 border border-rose-800/80 hover:bg-rose-900 active:bg-rose-800',
      subtle: 'bg-neutral-900 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-850 border border-neutral-800/60',
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs gap-1.5',
      md: 'h-8 px-3.5 text-xs tracking-tight gap-2',
      lg: 'h-9 px-4 text-sm gap-2',
      icon: 'h-8 w-8 p-0',
      'icon-sm': 'h-7 w-7 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
