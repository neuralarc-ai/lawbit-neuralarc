'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './page.module.sass'
import LandingNavbar from '@/components/LandingNavbar'
import Button from '@/components/Button'
import StarField from '@/components/StarField'

const features = [
    {
        icon: '/icons/document.svg',
        title: 'Document Creation',
        description: 'Generate complex legal documents instantly, from NDAs to legal agreements, with speed and precision.'
    },
    {
        icon: '/icons/risk.svg',
        title: 'Risk Analysis',
        description: 'Identify potential risks in your legal documents before signing with our advanced AI analysis.'
    },
    {
        icon: '/icons/legal.svg',
        title: 'Legal Assistance',
        description: 'Get advanced legal guidance on legal matters with our intelligent assistant.'
    }
]

const benefits = [
    {
        icon: '/icons/save.svg',
        title: 'Save thousands on legal fees',
        description: 'Reduce your legal expenses by automating repetitive tasks and process documents.'
    },
    {
        icon: '/icons/fast.svg',
        title: 'Create documents 10x faster',
        description: 'Generate legal documents in minutes instead of hours with AI assistance.'
    },
    {
        icon: '/icons/accuracy.svg',
        title: 'Identify risks with 95% accuracy',
        description: 'Our AI has been trained on millions of legal documents to identify potential risks.'
    },
    {
        icon: '/icons/compliance.svg',
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
        title: 'Startup',
        price: '$99',
        period: '/month',
        description: 'Ideal for small businesses and startups',
        features: [
            'Unlimited documents',
            'Advanced risk analysis',
            'Priority support',
            'Custom templates',
            'Document editing & versioning'
        ],
        buttonText: 'Get Started',
        popular: true
    },
    {
        title: 'Enterprise',
        price: '$299',
        period: '/month',
        description: 'For organizations with complex legal needs',
        features: [
            'Everything in Startup',
            'API access',
            'Custom AI training',
            'Dedicated support',
            'Multiple team access'
        ],
        buttonText: 'Contact Sales',
        popular: false
    }
]

export default function Home() {
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
                        Simplify <span>Your Legal Workflow</span>
                        <br />with <span>AI Precision</span>
                    </motion.h1>
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
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Button title="Try Now" />
                        <Button title="Get Started" className={styles.secondary} />
                    </motion.div>
                </div>
                <div className={styles.heroImage}>
                    <Image 
                        src="/images/contract.svg" 
                        alt="LawBit Interface Preview"
                        width={800}
                        height={450}
                        priority
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        {features.map((feature, index) => (
                            <motion.div 
                                key={feature.title}
                                className={styles.featureCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Image 
                                    src={feature.icon}
                                    alt={feature.title}
                                    width={48}
                                    height={48}
                                />
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={styles.benefits}>
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
                                    width={48}
                                    height={48}
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
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        What Our <span>Clients Say</span>
                    </motion.h2>
                    <motion.p 
                        className={styles.sectionSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        See how LawBit is transforming legal workflows for businesses
                    </motion.p>
                    <div className={styles.testimonialGrid}>
                        {testimonials.map((testimonial, index) => (
                            <motion.div 
                                key={testimonial.author}
                                className={styles.testimonialCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <p>{testimonial.text}</p>
                                <div className={styles.author}>
                                    <h4>{testimonial.author}</h4>
                                    <p>{testimonial.position}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className={styles.pricing}>
                <div className={styles.container}>
                    <motion.h2 
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Simple, <span>Transparent</span> Pricing
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
        </main>
    )
}
