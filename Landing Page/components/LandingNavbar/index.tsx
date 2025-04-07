import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import cn from 'classnames'
import { motion } from 'framer-motion'
import styles from './LandingNavbar.module.sass'

const LandingNavbar = () => {
    const router = useRouter()
    const [activeSection, setActiveSection] = useState<string>('')

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['features', 'benefits', 'testimonials', 'pricing']
            const scrollPosition = window.scrollY + 300 // Offset to trigger slightly before reaching the section

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const topPosition = element.offsetTop
                    const bottomPosition = topPosition + element.offsetHeight

                    if (scrollPosition >= topPosition && scrollPosition < bottomPosition) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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
            
            setActiveSection(sectionId)
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
                <Link href="/" className={styles.logo}>
                    <Image 
                        src="/images/logo.svg" 
                        alt="LawBit Logo" 
                        width={160} 
                        height={60}
                    />
                </Link>

                <div className={styles.nav}>
                    <button 
                        onClick={() => scrollToSection('features')} 
                        className={cn(styles.link, { [styles.active]: activeSection === 'features' })}
                    >
                        Features
                    </button>
                    <button 
                        onClick={() => scrollToSection('benefits')} 
                        className={cn(styles.link, { [styles.active]: activeSection === 'benefits' })}
                    >
                        Benefits
                    </button>
                    <button 
                        onClick={() => scrollToSection('testimonials')} 
                        className={cn(styles.link, { [styles.active]: activeSection === 'testimonials' })}
                    >
                        Testimonials
                    </button>
                    <button 
                        onClick={() => scrollToSection('pricing')} 
                        className={cn(styles.link, { [styles.active]: activeSection === 'pricing' })}
                    >
                        Pricing
                    </button>
                </div>

                <div className={styles.buttons}>
                    <button 
                        className={cn(styles.button, styles.loginButton)}
                        onClick={() => router.push('/auth/signin')}
                    >
                        Log in
                    </button>
                    <button 
                        className={cn(styles.button, styles.tryNowButton)}
                        onClick={() => router.push('/auth/signup')}
                    >
                        <span>Try Now</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </motion.nav>
    )
}

export default LandingNavbar 