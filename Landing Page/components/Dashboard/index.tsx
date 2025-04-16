import React, { useState } from 'react';
import cn from 'classnames';
import styles from './Dashboard.module.sass';
import CreateContract from '../CreateContract';
import AnalyzeContract from '../AnalyzeContract';
import GenerateLegalDraft from '../GenerateLegalDraft';
import Image from 'next/image';
import StarField from '@/components/StarField';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';

type TabType = 'create' | 'analyze' | 'generate';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('generate');

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
        <div className={styles.dashboard}>
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
            <div className={styles.container}>
                <motion.div 
                    className={styles.tabsWrapper}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className={styles.tabs} data-state={activeTab}>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'generate' })}
                            onClick={() => setActiveTab('generate')}
                        >
                            <Image 
                                src="/icons/generate.svg" 
                                alt="Generate" 
                                width={28} 
                                height={28}
                                className={styles.tabIcon}
                            />
                            <span className={styles.desktopText}>Generate Legal Draft</span>
                            <span className={styles.mobileText}>Generate</span>
                        </button>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'create' })}
                            onClick={() => setActiveTab('create')}
                        >
                            <Image 
                                src="/icons/document.svg" 
                                alt="Create" 
                                width={28} 
                                height={28}
                                className={styles.tabIcon}
                            />
                            <span className={styles.desktopText}>Legal Draft Template</span>
                            <span className={styles.mobileText}>Template</span>
                        </button>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'analyze' })}
                            onClick={() => setActiveTab('analyze')}
                        >
                            <Image 
                                src="/icons/analyze.svg" 
                                alt="Analyze" 
                                width={28} 
                                height={28}
                                className={styles.tabIcon}
                            />
                            <span className={styles.desktopText}>Analyze Legal Draft</span>
                            <span className={styles.mobileText}>Analyze</span>
                        </button>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        className={styles.contentWrapper}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.mainContent}>
                            {activeTab === 'create' ? <CreateContract /> : 
                             activeTab === 'analyze' ? <AnalyzeContract /> : 
                             <GenerateLegalDraft />}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;