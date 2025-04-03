'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import styles from './page.module.sass'
import LandingNavbar from '@/components/LandingNavbar'
import Button from '@/components/Button'
import StarField from '@/components/StarField'
import TestimonialCarousel from '../components/TestimonialCarousel'

const features = [
    {
        icon: '/icons/feature-1.svg',
        title: 'Document Creation',
        description: 'Generate compliant legal documents in minutes with our AI-powered templates and customization tools.'
    },
    {
        icon: '/icons/feature-2.svg',
        title: 'Risk Analysis',
        description: 'Identify potential issues in contracts before signing with our advanced AI risk assessment technology.'
    },
    {
        icon: '/icons/feature-3.svg',
        title: 'Legal Assistance',
        description: 'Get AI-powered guidance on legal matters with our intelligent assistant that understands legal context.'
    }
]

const benefits = [
    {
        icon: '/icons/choose-1.svg',
        title: 'Save thousands on legal fees',
        description: 'Reduce your legal expenses by automating repetitive tasks and process documents.'
    },
    {
        icon: '/icons/choose-2.svg',
        title: 'Create documents 10x faster',
        description: 'Generate legal documents in minutes instead of hours with AI assistance.'
    },
    {
        icon: '/icons/choose-3.svg',
        title: 'Identify risks with 95% accuracy',
        description: 'Our AI has been trained on millions of legal documents to identify potential risks.'
    },
    {
        icon: '/icons/choose-4.svg',
        title: 'Stay compliant with current regulations',
        description: 'Our system keeps in sync with the latest legal requirements to ensure compliance.'
    }
]

const testimonials = [
    {
        text: "I've spent half my time on legal paperwork. LawBit has cut that down by 75%. It's a game-changer for my business.",
        author: "Jessica Williams",
        position: "Operations Manager - TechStart Inc"
    },
    {
        text: "As a startup, it was never like this managing legal documents. LawBit makes it easy to stay compliant and grow with confidence.",
        author: "Michael Chen",
        position: "Founder - Swift Labs"
    },
    {
        text: "The risk analysis feature gives us peace of mind. We catch potential issues before they become problems.",
        author: "Sarah Williams",
        position: "Legal Manager - InnovateCo"
    }
]

const pricing = [
    {
        title: 'Free',
        price: 'Free',
        period: '',
        description: 'Perfect for exploring LawBit\'s capabilities',
        features: [
            'Document generation',
            'Basic risk analysis',
            'Library',
            'Up-to-date library'
        ],
        buttonText: 'Start Free Trial',
        popular: false
    },
    {
        title: 'Plus',
        price: '$8.99',
        description: 'Ideal for small businesses and startups',
        features: [
            'Unlimited document generations',
            'Advanced risk analysis',
            'Priority support',
            'Custom templates',
            'Document history & versioning'
        ],
        buttonText: 'Get Started',
        popular: true
    },
    {
        title: 'Ultra',
        price: '$14.99',    
        description: 'For organizations with complex legal needs',
        features: [
            'Everything in Startup',
            'Custom AI training',
            'Dedicated support',
            'Multiple team access'
        ],
        buttonText: 'Contact Sales',
        popular: false
    }
]

export default function Home() {
    const router = useRouter()

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

    const ellipseVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <main className={styles.main}>
            <motion.div 
                className={styles.starfieldWrapper}
                variants={starfieldVariants}
                initial="hidden"
                animate="visible"
            >
                <StarField />
            </motion.div>
            <motion.div 
                className={styles.ellipse}
                variants={ellipseVariants}
                initial="hidden"
                animate="visible"
            >
                <Image 
                    src="/images/white-radial.svg"
                    alt="Radial gradient"
                    width={1000}
                    height={1000}
                    priority
                />
            </motion.div>
            
            <LandingNavbar />
            
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <motion.h1 
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                       <span>AI-powered legal intelligence for modern businesses</span>
                    </motion.h1>
                    <motion.div 
                        className={styles.heroImage}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 0.8, 
                            delay: 0.1,
                            ease: [0.04, 0.62, 0.23, 0.98] 
                        }}
                    >
                        <Image
                            src="/images/contract.png"
                            alt="LawBit Hero"
                            width={1200}
                            height={1200}
                            priority
                            quality={100}
                        />
                    </motion.div>
                    <motion.p 
                        className={styles.description}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        LawBit helps startups and individuals create legal documents and analyze agreements to identify risks instantly
                    </motion.p>
                    <motion.div 
                        className={styles.buttons}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <button 
                            className={styles.tryNowButton}
                            onClick={() => router.push('/auth/signup')}
                        >
                            <span>Try Now</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button 
                            className={styles.loginButton}
                            onClick={() => router.push('/auth/signin')}
                        >
                            Get Started
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        {features.map((feature, index) => (
                            <motion.div 
                                key={feature.title}
                                className={styles.featureCardWrapper}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className={styles.featureCard}>
                                    <div className={styles.iconWrapper}>
                                        <div className={styles.iconSquare}>
                                            <div className={styles.iconCircle}>
                                                <Image 
                                                    src={feature.icon}
                                                    alt={feature.title}
                                                    width={24}
                                                    height={24}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className={styles.benefits}>
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Why Choose <span>LawBit</span>
                    </motion.h2>
                    <motion.p 
                        className={styles.sectionSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Our AI-powered platform delivers real business value
                    </motion.p>
                    <div className={styles.benefitsGrid}>
                        {benefits.map((benefit, index) => (
                            <motion.div 
                                key={benefit.title}
                                className={styles.benefitCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Image 
                                    src={benefit.icon}
                                    alt={benefit.title}
                                    width={72}
                                    height={72}
                                />
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className={styles.testimonials}>
                <TestimonialCarousel />
            </section>

            {/* Pricing Section */}
            <section id="pricing" className={styles.pricing}>
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Simple, <span>Transparent Pricing </span>
                    </motion.h2>
                    <motion.p 
                        className={styles.sectionSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Choose the plan that works best for your needs
                    </motion.p>
                    <div className={styles.pricingGrid}>
                        {pricing.map((plan, index) => (
                            <motion.div 
                                key={plan.title}
                                className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                {plan.popular && <div className={styles.popularBadge}>MOST POPULAR</div>}
                                <h3>{plan.title}</h3>
                                <div className={styles.price}>
                                    <span className={styles.amount}>{plan.price}</span>
                                    {plan.period && <span className={styles.period}>{plan.period}</span>}
                                </div>
                                <p className={styles.planDescription}>{plan.description}</p>
                                <ul className={styles.features}>
                                    {plan.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                                <Button 
                                    title={plan.buttonText}
                                    className={plan.popular ? styles.primary : styles.secondary}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerLeft}>
                            <div className={styles.footerLogo}>
                                <Image src="/icons/footer-logo.svg" alt="LawBit" width={160} height={55}/>
                                <span>AI-powered legal intelligence for modern businesses</span>
                            </div>
                        </div>
                        <div className={styles.footerLinks}>
                            <a href="/terms">Terms of use</a>
                            <span>•</span>
                            <a href="/privacy">Privacy Policy</a>
                        </div>
                        <div className={styles.footerBottom}>
                            <p>Copyright 2025. All rights reserved. &nbsp;&nbsp; Lawbit AI, a product by Neural Paths</p>
                        </div>
                    </div>
                    <div className={styles.footerIllustration}>
                        <Image 
                            src="/images/footer-illustration.png" 
                            alt="Footer Illustration" 
                            width={400} 
                            height={200}
                            className=''
                        />
                    </div>
                </div>
            </footer>
        </main>
    )
}
