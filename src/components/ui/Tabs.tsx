import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'line' | 'segmented';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  variant = 'line',
}) => {
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center bg-neutral-900 border border-neutral-800 p-0.5 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="text-[10px] text-neutral-500 tabular-nums">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center border-b border-neutral-800 gap-6 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors cursor-pointer border-b -mb-px ${
              isActive
                ? 'border-neutral-100 text-neutral-100'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="text-[10px] text-neutral-500 tabular-nums">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
