import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(({ type = 'info', title, description }: { type?: 'success' | 'error' | 'info'; title: string; description?: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 bg-neutral-900 border text-xs shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
              t.type === 'error'
                ? 'border-rose-800 text-rose-200'
                : t.type === 'success'
                ? 'border-neutral-700 text-neutral-100'
                : 'border-neutral-800 text-neutral-200'
            }`}
          >
            {t.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs leading-tight">{t.title}</p>
              {t.description && <p className="text-[11px] text-neutral-400 mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-neutral-500 hover:text-neutral-300 p-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
