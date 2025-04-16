'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cn from 'classnames'
import styles from './TestimonialCarousel.module.sass'
import StarField from '../StarField'

const testimonials = [
    {
        id: 1,
        text: "The speed at which we can now generate and review legal documents is incredible. What used to take days now takes minutes with LawBit's AI assistance.",
        author: "Jessica Williams",
        position: "Operations Manager, Innovate Solutions"
    },
    {
        id: 2,
        text: "As a small business owner, legal documents were always intimidating. LawBit makes it simple to create professional contracts that protect my business.",
        author: "Michael Chen",
        position: "Founder, Bright Ideas"
    },
    {
        id: 3,
        text: "The efficiency at which we can now generate and analyze legal documents is incredible. What used to take days now takes minutes with LawBit's AI assistance.",
        author: "Sarah Williams",
        position: "Legal Manager, Innovate Solutions"
    },
    {
        id: 4,
        text: "LawBit has revolutionized our document workflow. The AI's ability to understand and adapt to our specific legal needs is truly remarkable.",
        author: "David Lee",
        position: "Senior Counsel, Apex Industries"
    },
    {
        id: 5,
        text: "I was skeptical about using AI for legal documents, but LawBit exceeded my expectations. The accuracy and speed are unmatched.",
        author: "Emily Rodriguez",
        position: "Compliance Officer, Global Ventures"
    },
    {
        id: 6,
        text: "LawBit helped us streamline our contract management process. It's user-friendly and incredibly efficient, saving us valuable time and resources.",
        author: "Kevin Patel",
        position: "Project Lead, Quantum Dynamics"
    },
    {
        id: 7,
        text: "The personalized support and the AI's ability to handle complex legal terminology have made LawBit an indispensable tool for our team.",
        author: "Aisha Khan",
        position: "Legal Analyst, Zenith Corporation"
    },
    {
        id: 8,
        text: "LawBit has simplified our legal document creation and review processes. The AI's suggestions and insights are always spot-on.",
        author: "Ryan Carter",
        position: "Business Strategist, Nova Enterprises"
    },
    {
        id: 9,
        text: "I appreciate how LawBit keeps our legal documents organized and easily accessible. It's a game-changer for our firm.",
        author: "Sophia Gomez",
        position: "Partner, Stellar Group"
    },
    {
        id: 10,
        text: "The AI's ability to identify potential legal risks and suggest necessary revisions has been invaluable for our company.",
        author: "Ethan Brown",
        position: "Risk Manager, Vertex Solutions"
    }
];

type PositionType = 'left' | 'center' | 'right' | 'incoming' | 'outgoing';

const TestimonialCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(1) // 1 for right, -1 for left

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000) // Change slide every 5 seconds

        return () => clearInterval(timer)
    }, [])

    const getVisibleIndices = () => {
        const indices = []
        const prev = (testimonials.length + currentIndex - 1) % testimonials.length
        const next = (currentIndex + 1) % testimonials.length
        indices.push(prev, currentIndex, next)
        return indices
    }

    const getCardVariants = (index: number) => {
        const positions = {
            left: { x: '-60%', scale: 0.9, zIndex: 0 },
            center: { x: '0%', scale: 1.1, zIndex: 2 },
            right: { x: '60%', scale: 0.9, zIndex: 0 },
            incoming: { x: direction === 1 ? '120%' : '-120%', scale: 0.9, zIndex: 0 },
            outgoing: { x: direction === 1 ? '-120%' : '120%', scale: 0.9, zIndex: 0 }
        }

        const visibleIndices = getVisibleIndices()
        const indexPosition = visibleIndices.indexOf(index)
        let position: PositionType

        if (indexPosition === 1) position = 'center'
        else if (indexPosition === 2) position = 'right'
        else if (indexPosition === 0) position = 'left'
        else position = direction === 1 ? 'incoming' : 'outgoing'

        return {
            initial: position === 'incoming' ? positions.incoming : positions[position],
            animate: positions[position],
            exit: position === 'outgoing' ? positions.outgoing : positions[position],
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.5
            }
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.starfieldWrapper}>
                <StarField />
            </div>
            
            <div className={styles.carouselContainer}>
                <AnimatePresence initial={false}>
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            className={cn(styles.card, {
                                [styles.active]: index === currentIndex
                            })}
                            {...getCardVariants(index)}
                            style={{
                                display: getVisibleIndices().includes(index) ? 'block' : 'none'
                            }}
                        >
                            <p className={styles.testimonialText}>{testimonial.text}</p>
                            <h3 className={styles.author}>{testimonial.author}</h3>
                            <p className={styles.position}>{testimonial.position}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className={styles.navigationDots}>
                {testimonials.map((_, index) => (
                    <div
                        key={index}
                        className={cn(styles.dot, {
                            [styles.active]: index === currentIndex
                        })}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1)
                            setCurrentIndex(index)
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default TestimonialCarousel 