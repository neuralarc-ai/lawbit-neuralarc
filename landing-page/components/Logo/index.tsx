import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.sass';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
    showLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
    width = 150, 
    height = 90, 
    className = '', 
    showLink = true 
}) => {
    const LogoImage = (
        <div className={`${styles.logoWrapper} ${className}`}>
            <Image
                src="/images/logo.svg"
                width={width}
                height={height}
                alt="LawBit"
                priority
            />
            <span className={styles.betaLabel}>BETA</span>
        </div>
    );

    if (showLink) {
        return (
            <Link href="/" className={styles.logoLink}>
                {LogoImage}
            </Link>
        );
    }

    return LogoImage;
};

export default Logo; 