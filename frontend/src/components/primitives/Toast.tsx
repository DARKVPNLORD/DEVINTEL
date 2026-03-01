import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

const variantStyles: Record<ToastVariant, { border: string; dot: string }> = {
  success: { border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  error: { border: 'border-nothing-red/30', dot: 'bg-nothing-red' },
  warning: { border: 'border-amber-500/30', dot: 'bg-amber-500' },
  info: { border: 'border-nothing-grey-500/30', dot: 'bg-nothing-grey-400' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [toast, onRemove]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const style = variantStyles[toast.variant];

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 w-80 p-4 border shadow-lg',
        'bg-nothing-grey-900', style.border,
        'transition-all duration-300',
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slideUp'
      )}
    >
      <div className={clsx('w-1.5 h-1.5 mt-1.5 flex-shrink-0', style.dot)} />
      <p className="flex-1 text-xs font-mono text-nothing-grey-300">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-nothing-grey-600 hover:text-nothing-white transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div aria-live="polite" aria-label="Notifications" className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2">
          {toasts.map((toast) => (<ToastItem key={toast.id} toast={toast} onRemove={removeToast} />))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
