import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/**
 * IN-APP TOAST BİLDİRİMLERİ
 * Ekranın sağ üstünde otomatik kapanan bildirimler
 * 
 * Kullanım:
 * import { showToast } from './ToastNotification';
 * showToast('Başarılı!', 'success');
 * showToast('Uyarı!', 'warning');
 * showToast('Hata!', 'error');
 * showToast('Bilgi', 'info');
 */

let toastQueue = [];
let setToastsCallback = null;

export const showToast = (message, type = 'info', duration = 5000) => {
  const toast = {
    id: Date.now() + Math.random(),
    message,
    type,
    duration
  };
  
  toastQueue.push(toast);
  if (setToastsCallback) {
    setToastsCallback([...toastQueue]);
  }

  // Otomatik kaldırma
  setTimeout(() => {
    removeToast(toast.id);
  }, duration);
};

export const removeToast = (id) => {
  toastQueue = toastQueue.filter(t => t.id !== id);
  if (setToastsCallback) {
    setToastsCallback([...toastQueue]);
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastsCallback = setToasts;
    setToasts([...toastQueue]);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-400 text-emerald-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800';
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slide-in ${getStyles(toast.type)}`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
