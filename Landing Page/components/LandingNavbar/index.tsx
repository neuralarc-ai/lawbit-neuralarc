import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './LandingNavbar.module.sass'
import Logo from '../Logo'

const LandingNavbar = () => {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
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
                    <Link href="/auth/signin" className={`${styles.button} ${styles.loginButton}`}>
                        Log In
                    </Link>
                    <Link href="/auth/signup" className={styles.button}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}

export default LandingNavbar 