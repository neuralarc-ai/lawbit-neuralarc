import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.sass';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import TokenUsage from '../TokenUsage';
import SubscriptionModal from '../SubscriptionModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const isHistoryPage = pathname === '/history';
    const isTermsPage = pathname === '/terms';
    const isPrivacyPage = pathname === '/privacy';
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/signin');
        setIsOpen(false);
    };

    const handleBack = () => {
        if (isHistoryPage) {
            router.push('/contracts');
        } else if (isTermsPage || isPrivacyPage) {
            router.push('/contracts');
        }
    };

    const openSubscriptionModal = () => {
        setIsOpen(false); // Close the menu
        setIsSubscriptionModalOpen(true);
    };

    const closeSubscriptionModal = () => {
        setIsSubscriptionModalOpen(false);
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
                {(isHistoryPage || isTermsPage || isPrivacyPage) ? (
                    <button
                        className={styles.backButton}
                        onClick={handleBack}
                        aria-label="Back"
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
                                <div className={styles.profileSection}>
                                    {user?.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            width={40}
                                            height={40}
                                            className={styles.profileImage}
                                        />
                                    ) : (
                                        <div className={styles.profilePlaceholder}>
                                            {user?.email?.[0]?.toUpperCase() || 'N/A'}
                                        </div>
                                    )}
                                    <div className={styles.profileInfo}>
                                        <div className={styles.profileName}>
                                            {user?.user_metadata?.full_name || user?.email || 'Please Sign In'}
                                        </div>
                                        <div className={styles.profileEmail}>
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>
                                
                                {user && (
                                    <div className={styles.menuSection}>
                                        <TokenUsage />
                                    </div>
                                )}
                                
                                {user ? (
                                    <>
                                        <a href="/history" className={styles.menuItem}>
                                            History
                                        </a>
                                        <button onClick={openSubscriptionModal} className={styles.menuItem}>
                                            <span>Upgrade Plan</span>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        <button onClick={handleLogout} className={styles.menuItem}>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/auth/signin" className={styles.menuItem}>
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Subscription Modal */}
            <SubscriptionModal 
                isOpen={isSubscriptionModalOpen} 
                onClose={closeSubscriptionModal} 
            />
        </nav>
    );
};

export default Navbar; 