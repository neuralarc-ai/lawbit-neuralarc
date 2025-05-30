'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import styles from './page.module.sass'
import LandingNavbar from '@/components/LandingNavbar'
import Button from '@/components/Button'
import SubscriptionModal from '@/components/SubscriptionModal'
import TestimonialCarousel from '../components/TestimonialCarousel'
import { createClient } from '@/lib/supabase'

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
        title: 'Smart legal solutions, without the hefty price tag',
        description: 'Reduce your legal expenses by automating repetitive tasks and process documents.'
    },
    {
        icon: '/icons/choose-2.svg',
        title: 'Generate documents at lightning speed',
        description: 'Generate legal documents in minutes instead of hours with AI assistance.'
    },
    {
        icon: '/icons/choose-3.svg',
        title: 'Catch legal risks before they cost you,  with 95% accuracy',
        description: 'Our AI has been trained on millions of legal documents to identify potential risks.'
    },
    {
        icon: '/icons/choose-4.svg',
        title: 'Seamless compliance with every legal update',
        description: 'Our system keeps in sync with the latest legal requirements to ensure compliance.'
    }
]

const pricing = [
    {
        title: 'Free',
        price: 'Free',
        period: '',
        description: 'Perfect for exploring LawBit\'s capabilities',
        features: [
            '1 Legal Draft Template',
            '1 Basic risk analysis',
            '1 Legal Draft Generation',
        ],
        buttonText: 'Start Free Trial',
        popular: false
    },
    {
        title: 'Plus',
        price: '$14.99',
        description: 'When your legal go beyond the basics',
        features: [
            '250,000 tokens',
            '10+ Legal Drafts / Risk Analysis',
            'Usage History',
            'Advanced Agreement analysis',
        ],
        buttonText: 'Dive In',
        popular: true
    },
    {
        title: 'Ultra',
        price: '$24.99',    
        description: 'When your legal go beyond the ordinary',
        features: [
            '600,000 tokens',
            '30 Legal Draft / Risk Analysis',
            'Usage History',
            'Advanced Agreement analysis',
        ],
        buttonText: 'Discover Now',
        popular: false
    }
]

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const router = useRouter();
    
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkAuth();
    }, []);

    const handlePricingButtonClick = async (planTitle: string) => {
        // Check if user is logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            // Redirect to login page if not logged in
            router.push('/auth/signin');
        } else {
            // If logged in, open subscription modal
            setIsModalOpen(true);
        }
    };

    const handleLegalDraftClick = () => {
        router.push('/contracts');
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <main className={styles.main}>
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
                       <span>Revolutionize Your Legal Drafting with AI Precision</span>
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
                    <motion.p 
                        className={styles.description}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        LawBit helps startups and individuals create legal documents and analyze agreements to identify risks instantly
                    </motion.p>
                        <Image
                            src="/images/hero.png"
                            alt="LawBit Hero"
                            width={1200}
                            height={1200}
                            priority
                        />
                    </motion.div>
                    
                    {/* Mobile/Tablet Buttons */}
                    <motion.div 
                        className={styles.mobileButtons}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <button 
                            className={styles.mobileLoginButton}
                            onClick={() => router.push('/auth/signin')}
                        >
                            Log In
                        </button>
                        <button 
                            className={styles.mobileTryNowButton}
                            onClick={() => router.push('/auth/signup')}
                        >
                            Try Now <span className={styles.arrow}>→</span>
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
                                                <Image 
                                                    src={feature.icon}
                                                    alt={feature.title}
                                                    width={44}
                                                    height={44}
                                                />
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
                        data-text="Why Choose LawBit"
                    >
                        Why Choose&nbsp;<span>LawBit</span>
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
                                    className={styles.benefitIcon}
                                />
                                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                                <p className={styles.benefitDescription}>{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className={styles.testimonials}>
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        data-text="What Our Clients Say"
                    >
                        What Our Clients&nbsp;<span>Say</span>
                    </motion.h2>
                    <motion.p 
                        className={styles.sectionSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        See how LawBit is transforming legal workflow for businesses
                    </motion.p>
                    <div className={styles.testimonialWrapper}>
                        <TestimonialCarousel />
                    </div>
                    <p className={styles.testimonialText}>
                        &quot;LawBit&apos;s AI-powered contract generation is a game-changer. It saved us countless hours of legal drafting and helped us create watertight agreements with confidence.&quot;
                    </p>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className={styles.pricing}>
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        data-text="Transparent Pricing, Built for Businesses"
                    >
                        Transparent Pricing,&nbsp;<span>Built for Businesses</span>
                    </motion.h2>
                    <motion.p 
                        className={styles.sectionSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Unlock the features you need with the right plan
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
                                {plan.title === 'Free' ? (
                                    <Button 
                                        title={plan.buttonText}
                                        className={`${styles.freeButton}`}
                                        onClick={() => router.push('/auth/signup')}
                                    />
                                ) :
                                    <Button 
                                        title="Purchase Now"
                                        className={`${plan.popular ? styles.popularButton : styles.standardButton}`}
                                        onClick={() => handlePricingButtonClick(plan.title)}
                                    />
                                }
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Hunt Section */}
            <section className={styles.productHunt}>
                <div className={styles.container}>
                    <div className={styles.productHuntContent}>
                        <motion.h2 
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            data-text="Join the AI Legal Revolution"
                        >
                            Join the AI Legal&nbsp;<span>Revolution</span>
                        </motion.h2>
                        <motion.p 
                            className={styles.sectionSubtitle}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            From Hours to Seconds: Analyze Legal Docs with LawBit&apos;s Cutting-Edge AI
                        </motion.p>
                        <div className={styles.productHuntBadge}>
                            <a 
                                href="https://www.producthunt.com/products/lawbit/reviews?utm_source=badge-product_review&utm_medium=badge&utm_souce=badge-lawbit" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.badgeLink}
                            >
                                <Image 
                                    src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1053856&theme=dark"
                                    alt="Lawbit - Revolutionize Your Legal Drafting with AI Precision | Product Hunt"
                                    width={250}
                                    height={100}
                                    className={styles.badgeImage}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerMainContent}>
                        <div className={styles.footerLeft}>
                            <div className={styles.footerLogo}>
                                <Image 
                                    src="/icons/footer-logo.svg" 
                                    alt="LawBit" 
                                    width={100} 
                                    height={55}
                                    priority
                                />
                                <span>The future of legal ops; AI-powered, business-ready</span>
                            </div>
                            
                            <div className={styles.footerLinks}>
                                <a href="/terms">Terms of use</a>
                                <span>•</span>
                                <a href="/privacy">Privacy Policy</a>
                                <span>•</span>
                                <a href="/disclaimer">AI Enabled Content Notice</a>
                                <span>•</span>
                                <a href="/responsible-ai">Responsible & Ethical AI</a>
                            </div>
                            
                            <div className={styles.footerBottom}>
                                <p>
                                    Copyright 2025.   
                                    All rights reserved.
                                    A product by
                                    <Image 
                                        src="/neuralpath.svg" 
                                        alt="Neural Paths" 
                                        width={30} 
                                        height={30} 
                                        className={styles.neuralPathLogo}
                                    />
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-auto h-auto object-contain">
                            <Image 
                                src="/images/footer-illustration.png" 
                                alt="Footer Illustration" 
                                width={595} 
                                height={404}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </footer>
            
            {/* Subscription Modal */}
            <SubscriptionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </main>
    )
}
