import React from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizes[size]} object-cover border border-neutral-700 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} inline-flex items-center justify-center font-mono font-medium bg-neutral-800 text-neutral-200 border border-neutral-700/80 ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
