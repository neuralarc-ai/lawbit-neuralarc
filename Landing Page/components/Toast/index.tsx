import { useEffect } from 'react';
import styles from './Toast.module.sass';

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={styles.toast}>
            <div className={styles.content}>
                <span>{message}</span>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
    );
};

export default Toast; 