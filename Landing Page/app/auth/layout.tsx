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

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isSignUp = pathname === '/auth/signup'

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
        <div className={styles.auth}>
            <div className={styles.starfieldWrapper}>
                <motion.div 
                    className={styles.starfieldWrapper}
                    variants={starfieldVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <StarField />
                </motion.div>
                <div className={styles.ellipse}>
                    <Image
                        src="/images/white-radial.svg"
                        width={1000}
                        height={1080}
                        alt=""
                        priority
                    />
                </div>
            </div>
            
            <div className={styles.header}>
                <Logo width={150} height={90} />
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
            <div className={styles.container}>{children}</div>
            <Footer />
        </div>
    )
} 