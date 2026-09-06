import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, tone?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 lg:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-xl bg-navy-800 px-4 py-3 text-sm text-white shadow-card"
          >
            {t.tone === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
            ) : (
              <Info className="h-4 w-4 text-teal-400" />
            )}
            {t.message}
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              className="ml-1 text-navy-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
