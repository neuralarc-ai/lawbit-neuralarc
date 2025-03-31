import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import cn from 'classnames'
import styles from './LandingNavbar.module.sass'

const LandingNavbar = () => {
    const router = useRouter()

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            const navbarHeight = 80 // Height of navbar plus padding
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image 
                        src="/images/logo.svg" 
                        alt="LawBit Logo" 
                        width={160} 
                        height={60}
                    />
                </Link>

                <div className={styles.nav}>
                    <button onClick={() => scrollToSection('features')} className={styles.link}>Features</button>
                    <button onClick={() => scrollToSection('benefits')} className={styles.link}>Benefits</button>
                    <button onClick={() => scrollToSection('testimonials')} className={styles.link}>Testimonials</button>
                    <button onClick={() => scrollToSection('pricing')} className={styles.link}>Pricing</button>
                </div>

                <div className={styles.buttons}>
                    <button className={cn(styles.button, styles.loginButton)}>
                        Log in
                    </button>
                    <button 
                        className={cn(styles.button, styles.tryNowButton)}
                        onClick={() => router.push('/contracts')}
                    >
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