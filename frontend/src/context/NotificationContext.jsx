import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, [removeNotification]);

    const confirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setConfirmConfig({ title, message, resolve });
        });
    }, []);

    const handleConfirm = (value) => {
        if (confirmConfig?.resolve) {
            confirmConfig.resolve(value);
        }
        setConfirmConfig(null);
    };

    return (
        <NotificationContext.Provider value={{ addNotification, confirm }}>
            {children}
            
            {/* Toasts Container */}
            <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 sm:gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-full max-w-[360px] sm:max-w-[420px] items-center">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <Toast key={n.id} {...n} onClose={() => removeNotification(n.id)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmConfig && (
                    <ConfirmModal 
                        {...confirmConfig} 
                        onConfirm={() => handleConfirm(true)} 
                        onCancel={() => handleConfirm(false)} 
                    />
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle2 className="text-emerald-400" size={20} />,
        error: <AlertCircle className="text-rose-400" size={20} />,
        info: <Info className="text-sky-400" size={20} />
    };

    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-rose-500/10 border-rose-500/20',
        info: 'bg-sky-500/10 border-sky-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={`pointer-events-auto w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border shadow-lg ${bgColors[type]}`}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-xs sm:text-sm font-semibold text-white flex-grow leading-tight">{message}</p>
            <button 
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
                <X size={14} className="sm:hidden" />
                <X size={16} className="hidden sm:block" />
            </button>
        </motion.div>
    );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
                onClick={onCancel}
                className="absolute inset-0 bg-slate-950/80"
            />
            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center pointer-events-auto">
                <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed px-4">{message}</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-rose-600/20 transition-all active:scale-95"
                    >
                        Confirm Action
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold transition-all active:scale-95"
                    >
                        Keep This
                    </button>
                </div>
            </div>
        </div>
    );
};

export const useNotification = () => useContext(NotificationContext);
