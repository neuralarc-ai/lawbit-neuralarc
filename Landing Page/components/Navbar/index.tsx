import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.sass';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isHistoryPage = pathname === '/history';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        // Add logout logic here
        setIsOpen(false);
    };

    const handleBack = () => {
        router.push('/contracts');
    };

    const navbarVariants = {
        hidden: { 
            opacity: 0,
            y: -20
        },
        visible: { 
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const dialogVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.9,
            y: -20
        },
        visible: { 
            opacity: 1, 
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: { 
            opacity: 0, 
            scale: 0.9,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.2
            }
        },
        exit: { 
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                delay: i * 0.1,
                ease: "easeOut"
            }
        })
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {isHistoryPage ? (
                    <button
                        className={styles.backButton}
                        onClick={handleBack}
                        aria-label="Back to contracts"
                    >
                        <div className={styles.menuSquare}>
                            <div className={styles.menuCircle}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </button>
                ) : (
                    <div className={styles.placeholder} />
                )}
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src="/icons/lawbit-preview.svg"
                        alt="LawBit"
                        width={78}
                        height={78}
                        className={styles.logo}
                        priority
                    />
                </Link>
                <button
                    className={styles.menuButton}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <div className={styles.menuSquare}>
                        <div className={styles.menuCircle}>
                            <div className={cn(styles.menuLine, { [styles.open]: isOpen })} />
                            <div className={cn(styles.menuLine, { [styles.open]: isOpen })} />
                        </div>
                    </div>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                        />
                        <motion.div
                            className={styles.dialog}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={styles.menuItems}>
                                <a href="/history" className={styles.menuItem}>
                                    History
                                </a>
                                <button onClick={handleLogout} className={styles.menuItem}>
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar; 