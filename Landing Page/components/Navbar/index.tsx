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
    const isContractsPage = pathname === '/contracts';
    const isResponsibleAIPage = pathname === '/responsible-ai';
    const isDisclaimerPage = pathname === '/disclaimer';
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

        // Add event listener for opening subscription modal
        const handleOpenSubscriptionModal = () => {
            setIsSubscriptionModalOpen(true);
        };
        
        window.addEventListener('openSubscriptionModal', handleOpenSubscriptionModal);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('openSubscriptionModal', handleOpenSubscriptionModal);
        };
    }, [supabase.auth]);

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
        } else if (isTermsPage || isPrivacyPage || isDisclaimerPage) {
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

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {(isHistoryPage || isTermsPage || isPrivacyPage || isContractsPage || isResponsibleAIPage || isDisclaimerPage) ? (
                isContractsPage ? (
                    <Link href="/" className={styles.logoLink}>
                        <div className={styles.logoContainer}>
                            <Image 
                                src="/icons/lawbit-logo.svg" 
                                alt="Lawbit Logo" 
                                width={130} 
                                height={60}
                                priority
                            />
                        </div>
                    </Link>
                ) : (
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
                )
            ) : (
                <div className={styles.placeholder} />
            )}
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
                                        <TokenUsage className={styles.tokenUsage} />
                                    </div>
                                )}
                                
                                {user ? (
                                    <>
                                        <a href="/history" className={styles.menuItem}>
                                            <span>History</span>
                                            <Image src="/icons/history.svg" alt="History" width={20} height={20} className={styles.menuIcon} />
                                        </a>
                                        <button onClick={openSubscriptionModal} className={styles.menuItem}>
                                            <span>Upgrade Plan</span>
                                            <Image src="/icons/upgrade.svg" alt="Upgrade" width={20} height={20} className={styles.menuIcon} />
                                        </button>
                                        <button onClick={handleLogout} className={styles.menuItem}>
                                            <span>Logout</span>
                                            <Image src="/icons/logout.svg" alt="Logout" width={20} height={20} className={styles.menuIcon} />
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