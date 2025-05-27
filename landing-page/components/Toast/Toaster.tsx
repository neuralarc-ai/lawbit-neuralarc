import { createContext, useContext, useState, ReactNode } from 'react';
import Toast from './index';
import styles from './Toast.module.sass';

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface Toast {
    id: number;
    message: string;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toasterContainer}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}; 