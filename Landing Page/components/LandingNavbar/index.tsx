import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import styles from './LandingNavbar.module.sass'
import Logo from '../Logo'
import { createClient } from '@/lib/supabase'

const LandingNavbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        router.push('/');
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
        // Close mobile menu after clicking a link
        setIsMobileMenuOpen(false);
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    return (
        <motion.nav 
            className={styles.navbar}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.5,
                ease: [0.04, 0.62, 0.23, 0.98]
            }}
        >
            <div className={styles.container}>
                <Logo width={160} height={60} />

                {/* Hamburger Icon for Mobile */}
                <div className={styles.mobileMenuToggle} onClick={toggleMobileMenu}>
                    <span className={isMobileMenuOpen ? styles.open : ''}></span>
                    <span className={isMobileMenuOpen ? styles.open : ''}></span>
                    <span className={isMobileMenuOpen ? styles.open : ''}></span>
                </div>

                {/* Desktop Navigation */}
                <div className={styles.desktopNav}>
                <div className={styles.nav}>
                    <button onClick={() => scrollToSection('features')} className={styles.link}>Features</button>
                    <button onClick={() => scrollToSection('benefits')} className={styles.link}>Benefits</button>
                    <button onClick={() => scrollToSection('testimonials')} className={styles.link}>Testimonials</button>
                    <button onClick={() => scrollToSection('pricing')} className={styles.link}>Pricing</button>
                </div>

                <div className={styles.buttons}>
                        {isLoggedIn ? (
                            <>
                                <Link href="/contracts" className={styles.button}>
                                    Generate Draft
                                </Link>
                                <button onClick={handleLogout} className={`${styles.button} ${styles.loginButton}`}>
                                    Logout
                    </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signin" className={`${styles.button} ${styles.loginButton}`}>
                                    Log In
                                </Link>
                                <Link href="/auth/signup" className={styles.button}>
                                    Try Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
                    <div className={styles.mobileLinks}>
                        <button onClick={() => scrollToSection('features')} className={styles.mobileLink}>Features</button>
                        <button onClick={() => scrollToSection('benefits')} className={styles.mobileLink}>Benefits</button>
                        <button onClick={() => scrollToSection('testimonials')} className={styles.mobileLink}>Testimonials</button>
                        <button onClick={() => scrollToSection('pricing')} className={styles.mobileLink}>Pricing</button>
                    </div>

                    <div className={styles.mobileButtons}>
                        {isLoggedIn ? (
                            <>
                                <Link href="/contracts" className={styles.mobileButton}>
                                    Generate Draft
                                </Link>
                                <button onClick={handleLogout} className={`${styles.mobileButton} ${styles.mobileLoginButton}`}>
                                    Logout
                    </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signin" className={`${styles.mobileButton} ${styles.mobileLoginButton}`}>
                                    Log In
                                </Link>
                                <Link href="/auth/signup" className={styles.mobileButton}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}

export default LandingNavbar 