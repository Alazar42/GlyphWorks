import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | { type: 'separator' })[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[160px] bg-neutral-900 border border-neutral-800 shadow-xl py-1 text-xs text-neutral-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, idx) => {
            if ('type' in item && item.type === 'separator') {
              return <div key={`sep-${idx}`} className="h-px bg-neutral-800 my-1" />;
            }
            const dropdownItem = item as DropdownItem;
            return (
              <button
                key={dropdownItem.id}
                type="button"
                disabled={dropdownItem.disabled}
                onClick={() => {
                  dropdownItem.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                  dropdownItem.destructive
                    ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                }`}
              >
                {dropdownItem.icon && <span className="w-3.5 h-3.5 shrink-0 text-neutral-400">{dropdownItem.icon}</span>}
                <span className="truncate">{dropdownItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
