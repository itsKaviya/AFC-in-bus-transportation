'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    error:   'border-red-500/50 bg-red-500/10 text-red-400',
    info:    'border-sky-500/50 bg-sky-500/10 text-sky-400',
    warning: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-fade-in shadow-xl ${colors[t.type]}`}
        >
          <span className="text-lg font-bold mt-0.5">{icons[t.type]}</span>
          <p className="flex-1 text-sm font-medium text-slate-200">{t.message}</p>
          <button onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-white transition-colors ml-2">✕</button>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
