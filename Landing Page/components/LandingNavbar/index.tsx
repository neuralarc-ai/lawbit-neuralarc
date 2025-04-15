import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './LandingNavbar.module.sass'
import Logo from '../Logo'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LandingNavbar = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
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
    }, [supabase.auth]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
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

                <div className={styles.nav}>
                    <button onClick={() => scrollToSection('features')} className={styles.link}>Features</button>
                    <button onClick={() => scrollToSection('benefits')} className={styles.link}>Benefits</button>
                    <button onClick={() => scrollToSection('testimonials')} className={styles.link}>Testimonials</button>
                    <button onClick={() => scrollToSection('pricing')} className={styles.link}>Pricing</button>
                </div>

                <div className={styles.buttons}>
                    {user ? (
                        <>
                            <Link href="/contracts" className={`${styles.button} ${styles.loginButton}`}>
                                Generate Legal Draft
                            </Link>
                            <button onClick={handleLogout} className={styles.button}>
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" className={`${styles.button} ${styles.loginButton}`}>
                                Log In
                            </Link>
                            <Link href="/auth/signup" className={styles.button}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}

export default LandingNavbar 