import React, { useState, useRef } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  shortcut?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  shortcut,
  side = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const show = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 250);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute pointer-events-none z-50 whitespace-nowrap bg-neutral-900 border border-neutral-700/80 px-2 py-1 text-[11px] text-neutral-200 shadow-lg flex items-center gap-1.5 ${sidePositions[side]}`}
        >
          <span>{content}</span>
          {shortcut && (
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1 py-0.5 border border-neutral-700/60">
              {shortcut}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
