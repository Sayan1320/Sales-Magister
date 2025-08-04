import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const variants = {
    success: {
      backgroundColor: 'var(--success-light)',
      borderColor: 'var(--success)',
      color: 'var(--success)'
    },
    error: {
      backgroundColor: 'var(--danger-light)',
      borderColor: 'var(--danger)',
      color: 'var(--danger)'
    },
    warning: {
      backgroundColor: 'var(--warning-light)',
      borderColor: 'var(--warning)',
      color: 'var(--warning)'
    },
    info: {
      backgroundColor: 'var(--info-light)',
      borderColor: 'var(--info)',
      color: 'var(--info)'
    }
  };

  const Icon = icons[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="toast"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid',
        backgroundColor: 'var(--bg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '320px',
        maxWidth: '500px',
        ...variants[toast.type]
      }}
    >
      <Icon size={20} />
      
      <div className="flex-1">
        {toast.title && (
          <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
          {toast.message}
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClose(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '2px'
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: 'var(--space-4)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};