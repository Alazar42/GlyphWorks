import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative z-10 w-full ${maxWidths[maxWidth]} bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-neutral-100 flex flex-col space-y-4`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="dialog-title" className="text-sm font-semibold tracking-tight text-neutral-100">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-neutral-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 transition-colors p-1 -mr-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-neutral-300">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
