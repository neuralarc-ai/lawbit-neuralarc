import React from 'react';
import styles from './PasswordStrength.module.sass';

interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const calculateStrength = (password: string): number => {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 20;
        
        // Uppercase check
        if (/[A-Z]/.test(password)) strength += 20;
        
        // Lowercase check
        if (/[a-z]/.test(password)) strength += 20;
        
        // Number check
        if (/[0-9]/.test(password)) strength += 20;
        
        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        return strength;
    };

    const getStrengthColor = (strength: number): string => {
        if (strength <= 20) return '#FF3B30';
        if (strength <= 40) return '#FF9500';
        if (strength <= 60) return '#FFCC00';
        if (strength <= 80) return '#34C759';
        return '#30B0C7';
    };

    const getStrengthText = (strength: number): string => {
        if (strength <= 20) return 'Very Weak';
        if (strength <= 40) return 'Weak';
        if (strength <= 60) return 'Medium';
        if (strength <= 80) return 'Strong';
        return 'Very Strong';
    };

    // Only show strength indicator and requirements if password has any input
    if (!password) {
        return null;
    }

    const strength = calculateStrength(password);
    const strengthColor = getStrengthColor(strength);
    const strengthText = getStrengthText(strength);

    return (
        <div className={styles.container}>
            <div className={styles.strengthBar}>
                <div 
                    className={styles.strengthIndicator} 
                    style={{ 
                        width: `${strength}%`,
                        backgroundColor: strengthColor
                    }}
                />
            </div>
            <div className={styles.strengthText} style={{ color: strengthColor }}>
                {strengthText}
            </div>
            <div className={styles.requirements}>
                <p className={password.length >= 8 ? styles.met : styles.unmet}>
                    • At least 8 characters
                </p>
                <p className={/[A-Z]/.test(password) ? styles.met : styles.unmet}>
                    • At least one uppercase letter
                </p>
                <p className={/[a-z]/.test(password) ? styles.met : styles.unmet}>
                    • At least one lowercase letter
                </p>
                <p className={/[0-9]/.test(password) ? styles.met : styles.unmet}>
                    • At least one number
                </p>
                <p className={/[^A-Za-z0-9]/.test(password) ? styles.met : styles.unmet}>
                    • At least one special character
                </p>
            </div>
        </div>
    );
};

export default PasswordStrength; 