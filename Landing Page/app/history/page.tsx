'use client'

import React, { useState } from 'react';
import styles from './History.module.sass';
import HistoryCard from '@/components/HistoryCard';
import cn from 'classnames';
import Image from 'next/image';
import StarField from '@/components/StarField';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

const mockGeneratedData = [
    {
        title: 'Service Agreement between AA and AAA',
        date: 'Mar 20, 2025 at 01:23PM',
        status: 'Completed' as const,
        riskLevel: 'Medium Risk' as const,
        riskScore: 57,
        clausesCount: 10,
        keyStats: [
            { label: 'Payment terms', type: 'warning' as const },
            { label: 'Limitation of liability', type: 'normal' as const }
        ],
        jurisdiction: 'United States',
        moreCount: 3
    },
    {
        title: 'Employment Contract - Senior Developer',
        date: 'Mar 19, 2025 at 03:45PM',
        status: 'Completed' as const,
        riskLevel: 'Low Risk' as const,
        riskScore: 32,
        clausesCount: 8,
        keyStats: [
            { label: 'Non-compete', type: 'normal' as const },
            { label: 'Intellectual property', type: 'normal' as const }
        ],
        jurisdiction: 'United States',
        moreCount: 2
    },
    {
        title: 'NDA for Project Phoenix',
        date: 'Mar 18, 2025 at 11:15AM',
        status: 'Completed' as const,
        riskLevel: 'High Risk' as const,
        riskScore: 82,
        clausesCount: 6,
        keyStats: [
            { label: 'Confidentiality', type: 'warning' as const },
            { label: 'Term and termination', type: 'warning' as const }
        ],
        jurisdiction: 'United States',
        moreCount: 4
    }
];

const mockAnalyzedData = [
    {
        title: 'Vendor Agreement Analysis',
        date: 'Mar 20, 2025 at 02:30PM',
        status: 'Completed' as const,
        riskLevel: 'High Risk' as const,
        riskScore: 75,
        clausesCount: 12,
        keyStats: [
            { label: 'Data protection', type: 'warning' as const },
            { label: 'Service levels', type: 'warning' as const }
        ],
        jurisdiction: 'European Union',
        moreCount: 5
    },
    {
        title: 'License Agreement Review',
        date: 'Mar 19, 2025 at 04:20PM',
        status: 'Completed' as const,
        riskLevel: 'Medium Risk' as const,
        riskScore: 45,
        clausesCount: 15,
        keyStats: [
            { label: 'Usage rights', type: 'normal' as const },
            { label: 'Royalties', type: 'warning' as const }
        ],
        jurisdiction: 'United States',
        moreCount: 3
    },
    {
        title: 'Partnership Agreement Analysis',
        date: 'Mar 18, 2025 at 10:45AM',
        status: 'Completed' as const,
        riskLevel: 'Low Risk' as const,
        riskScore: 28,
        clausesCount: 9,
        keyStats: [
            { label: 'Profit sharing', type: 'normal' as const },
            { label: 'Governance', type: 'normal' as const }
        ],
        jurisdiction: 'United Kingdom',
        moreCount: 2
    }
];

const HistoryPage = () => {
    const [activeTab, setActiveTab] = useState<'generated' | 'analyzed'>('generated');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

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
        <div className={styles.container}>
            <Navbar />
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
            <div className={styles.content}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Usage History
                </motion.h1>

                <motion.div 
                    className={styles.tabsWrapper}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className={styles.tabs} data-state={activeTab}>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'generated' })}
                            onClick={() => setActiveTab('generated')}
                        >
                            <Image 
                                src="/icons/generated.svg" 
                                alt="Generated" 
                                width={20} 
                                height={20}
                                className={styles.tabIcon}
                            />
                            Generated
                        </button>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'analyzed' })}
                            onClick={() => setActiveTab('analyzed')}
                        >
                            <Image 
                                src="/icons/analyzed.svg" 
                                alt="Analyzed" 
                                width={20} 
                                height={20}
                                className={styles.tabIcon}
                            />
                            Analyzed
                        </button>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        className={styles.grid}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'generated' ? mockGeneratedData.map((item, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <HistoryCard {...item} />
                            </motion.div>
                        )) : mockAnalyzedData.map((item, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <HistoryCard {...item} />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistoryPage; 