'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './auth.module.sass'
import { motion } from 'framer-motion'
import StarField from '@/components/StarField'
import Footer from '@/components/Footer'
import Logo from '@/components/Logo'

// Define image paths
const AUTH_IMAGES = {
    login: '/images/login-illustration.png',
    signup: '/images/signup-illustration.png'
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isSignUp = pathname === '/auth/signup'
    const authImage = isSignUp ? AUTH_IMAGES.signup : AUTH_IMAGES.login

    const starfieldVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className={`${styles.auth} fustat`}>
            <div className={styles.starfieldWrapper}>
                <motion.div 
                    className={styles.starfieldWrapper}
                    variants={starfieldVariants}
                    initial="hidden"
                    animate="visible"
                >
                    
                </motion.div>
                <div className={styles.ellipse}>
                    
                </div>
            </div>
            
            <div className={styles.authContainer}>
                <div className={styles.authLeft}>
                    <div className={`${styles.logoText} fustat`}>Lawbit</div>
                    <div className={styles.authImageContainer}>
                        <Image 
                            src={authImage} 
                            alt={isSignUp ? "Sign Up Illustration" : "Login Illustration"} 
                            width={640} 
                            height={486}
                            className={styles.authImage}
                            priority
                        />
                    </div>
                </div>
                <div className={styles.authRight}>
                    <div className={styles.header}>
                        <div className={styles.actions} data-state={isSignUp ? 'signup' : 'signin'}>
                            <Link
                                className={`${styles.link} ${
                                    pathname === '/auth/signin' ? styles.active : ''
                                }`}
                                href="/auth/signin"
                            >
                                Log In
                            </Link>
                            <Link
                                className={`${styles.link} ${
                                    pathname === '/auth/signup' ? styles.active : ''
                                }`}
                                href="/auth/signup"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                    <div className={styles.container}>
                        {children}
                    </div>
                </div>
            </div>
            <Footer className={styles.footer} />
        </div>
    )
} 