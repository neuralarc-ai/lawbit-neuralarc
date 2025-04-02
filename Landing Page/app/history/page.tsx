'use client'

import React, { useState, useEffect } from 'react';
import styles from './History.module.sass';
import HistoryCard from '@/components/HistoryCard';
import cn from 'classnames';
import Image from 'next/image';
import StarField from '@/components/StarField';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getContractHistory } from '@/services/contractService';

const HistoryPage = () => {
    const [activeTab, setActiveTab] = useState<'generated' | 'analyzed'>('generated');
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const data = await getContractHistory();
                setContracts(data);
            } catch (err) {
                setError('Failed to load contract history');
                console.error('Error fetching contracts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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
                    Contract History
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
                        {loading ? (
                            <div className={styles.loading}>Loading contracts...</div>
                        ) : error ? (
                            <div className={styles.error}>{error}</div>
                        ) : activeTab === 'generated' ? (
                            contracts.map((contract) => (
                                <motion.div key={contract.id} variants={itemVariants}>
                                    <HistoryCard
                                        id={contract.id}
                                        title={contract.title}
                                        date={formatDate(contract.created_at)}
                                        content={contract.content}
                                        type={contract.type}
                                        status={contract.status}
                                        details={contract.contract_history[0]?.details || {}}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className={styles.empty}>No analyzed contracts yet</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <Footer />
        </div>
    );
};

export default HistoryPage; 