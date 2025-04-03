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
    }
]

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

    const getCardVariants = (index: number) => {
        const positions = {
            left: { x: '-60%', scale: 0.9, zIndex: 0 },
            center: { x: '0%', scale: 1.1, zIndex: 2 },
            right: { x: '60%', scale: 0.9, zIndex: 0 },
            incoming: { x: '-120%', scale: 0.9, zIndex: 0 },
            outgoing: { x: '120%', scale: 0.9, zIndex: 0 }
        }

        const currentPosition = (testimonials.length + index - currentIndex) % testimonials.length
        let position: PositionType

        if (currentPosition === 0) position = 'center'
        else if (currentPosition === 1) position = 'right'
        else if (currentPosition === testimonials.length - 1) position = 'left'
        else if (direction === 1 && currentPosition > 1) position = 'outgoing'
        else position = 'incoming'

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
            <h2 className={styles.title}>What Our Clients Say</h2>
            <p className={styles.subtitle}>See how LawBit is transforming legal workflows for businesses</p>
            
            <div className={styles.carouselContainer}>
                <AnimatePresence initial={false}>
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            className={cn(styles.card, {
                                [styles.active]: index === currentIndex
                            })}
                            {...getCardVariants(index)}
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