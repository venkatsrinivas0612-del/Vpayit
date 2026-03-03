import { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const STYLES = {
    error:   'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
    info:    'bg-slate-800 text-white',
  };

  const ICONS = {
    error:   <AlertCircle className="w-4 h-4 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    info:    <Info className="w-4 h-4 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container — top-right on desktop, top-center on mobile */}
      <div className="fixed top-4 right-4 left-4 md:left-auto z-[9999] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
              w-full md:max-w-sm pointer-events-auto ${STYLES[t.type] || STYLES.info}`}
          >
            {ICONS[t.type]}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-1 opacity-75 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // Return a no-op if used outside provider (graceful fallback)
  if (!ctx) return { addToast: () => {}, removeToast: () => {} };
  return ctx;
}
