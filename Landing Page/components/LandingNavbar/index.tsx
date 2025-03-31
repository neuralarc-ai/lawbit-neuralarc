import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import cn from 'classnames'
import styles from './LandingNavbar.module.sass'

const LandingNavbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image 
                        src="/images/logo.svg" 
                        alt="LawBit Logo" 
                        width={120} 
                        height={60}
                    />
                </Link>

                <div className={styles.nav}>
                    <Link href="#features" className={styles.link}>Features</Link>
                    <Link href="#benefits" className={styles.link}>Benefits</Link>
                    <Link href="#testimonials" className={styles.link}>Testimonials</Link>
                    <Link href="#pricing" className={styles.link}>Pricing</Link>
                </div>

                <div className={styles.buttons}>
                    <button className={cn(styles.button, styles.loginButton)}>
                        Log in
                    </button>
                    <button className={cn(styles.button, styles.tryNowButton)}>
                        <span>Try Now</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default LandingNavbar 