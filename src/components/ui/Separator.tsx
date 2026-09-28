import React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`w-px h-full bg-neutral-800 shrink-0 ${className}`} />;
  }
  return <div className={`h-px w-full bg-neutral-800 shrink-0 ${className}`} />;
};
