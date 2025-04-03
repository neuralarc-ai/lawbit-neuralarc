'use client'

import React, { useState, useEffect } from 'react';
import styles from './History.module.sass';
import HistoryCard from '@/components/HistoryCard';
import AnalyzedContractCard from '@/components/AnalyzedContractCard';
import ContractPreview from '@/components/ContractPreview';
import cn from 'classnames';
import Image from 'next/image';
import StarField from '@/components/StarField';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getContractHistory } from '@/services/contractService';
import { RiskLevel } from '@/components/AnalyzedContractCard';

const HistoryPage = () => {
    const [activeTab, setActiveTab] = useState<'generated' | 'analyzed'>('generated');
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedContract, setSelectedContract] = useState<any | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const data = await getContractHistory();
                setContracts(data);
            } catch (err) {
                setError('Please sign in to view your contract history');
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

    const handlePreviewContract = (id: string) => {
        const contract = contracts.find(c => c.id === id);
        if (contract) {
            setSelectedContract(contract);
            setPreviewContent(contract.content);
            setShowPreview(true);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setSelectedContract(null);
    };

    // Mock data for analyzed contracts (for demonstration purposes)
    const analyzedContracts = [
        {
            id: 'analyzed-1',
            title: 'Employment Contract Analysis',
            date: new Date().toISOString(),
            content: 'This is a detailed analysis of the employment contract. It includes risk assessment, clause analysis, and recommendations for improvement.\n\nKey Findings:\n- The termination clause has high risk factors\n- The non-compete clause is overly restrictive\n- The intellectual property clause needs clarification\n\nRecommendations:\n- Revise the termination clause to include clear conditions\n- Limit the scope of the non-compete clause\n- Add specific definitions for intellectual property',
            riskScore: 75,
            riskLevel: 'High Risk' as RiskLevel,
            clausesIdentified: 12,
            highRiskItems: 3
        },
        {
            id: 'analyzed-2',
            title: 'NDA Agreement Analysis',
            date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            content: 'Analysis of the Non-Disclosure Agreement reveals several areas of concern.\n\nKey Findings:\n- The definition of confidential information is too broad\n- The duration of the agreement is excessive\n- The jurisdiction clause is missing\n\nRecommendations:\n- Narrow the definition of confidential information\n- Limit the duration to a reasonable timeframe\n- Add a jurisdiction clause specifying applicable law',
            riskScore: 45,
            riskLevel: 'Medium Risk' as RiskLevel,
            clausesIdentified: 8,
            highRiskItems: 1
        },
        {
            id: 'analyzed-3',
            title: 'Service Agreement Analysis',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            content: 'The service agreement has been analyzed for potential risks and compliance issues.\n\nKey Findings:\n- The payment terms are clear and reasonable\n- The service level agreement lacks specific metrics\n- The liability limitations are appropriate\n\nRecommendations:\n- Add specific performance metrics to the SLA\n- Include a dispute resolution process\n- Clarify the scope of services',
            riskScore: 25,
            riskLevel: 'Low Risk' as RiskLevel,
            clausesIdentified: 10,
            highRiskItems: 0
        }
    ];

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
                                        onPreview={handlePreviewContract}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                className={styles.dashboard}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className={styles.dashboardContent}>
                                    <div className={styles.iconWrapper}>
                                        <Image 
                                            src="/icons/document.svg" 
                                            alt="Document Icon" 
                                            width={32} 
                                            height={32}
                                            className={styles.documentIcon}
                                        />
                                    </div>
                                    <h2>Coming Soon!</h2>
                                    <p>We're working on something exciting. Stay tuned for updates!</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <Footer />

            <AnimatePresence>
                {showPreview && (
                    <ContractPreview
                        content={previewContent}
                        onClose={handleClosePreview}
                        isLoading={previewLoading}
                        error={previewError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryPage; 