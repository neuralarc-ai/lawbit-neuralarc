import React, { useState } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.sass';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        // Add logout logic here
        setIsMenuOpen(false);
    };

    const navbarVariants = {
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

    const logoVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.2
            }
        }
    };

    const menuButtonVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 0.3
            }
        },
        hover: {
            opacity: 0.8,
            transition: {
                duration: 0.2
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
        <>
            <motion.nav 
                className={styles.navbar}
                variants={navbarVariants}
                initial="hidden"
                animate="visible"
            >
                <div className={styles.container}>
                    <motion.div
                        variants={logoVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Image 
                            src="/icons/lawbit-logo.svg" 
                            alt="LawBit" 
                            width={160} 
                            height={40}
                            className={styles.logo}
                        />
                    </motion.div>
                    <motion.div 
                        className={styles.menuButton}
                        onClick={() => setIsMenuOpen(true)}
                        variants={menuButtonVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                    >
                        <Image 
                            src="/icons/menu.svg" 
                            alt="Menu" 
                            width={72} 
                            height={72}
                        />
                    </motion.div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            className={styles.overlay}
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div 
                            className={styles.dialogWrapper}
                            variants={dialogVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div 
                                className={styles.dialog}
                            >
                                <motion.div 
                                    className={styles.menuItem}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={0}
                                    onClick={() => {
                                        window.location.href = '/history';
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    History
                                </motion.div>
                                <motion.div 
                                    className={styles.menuItem}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={1}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar; 