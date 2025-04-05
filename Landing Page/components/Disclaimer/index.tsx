'use client'

import { useState } from 'react';
import cn from 'classnames';
import styles from './Disclaimer.module.sass';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Disclaimer = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const sections = [
        {
            id: 'purpose',
            title: 'Purpose and Scope',
            content: 'This website provides tools for creating and analyzing legal documents for informational purposes only. It does not offer legal advice, representation, or services in any jurisdiction.'
        },
        {
            id: 'relationship',
            title: 'No Attorney-Client Relationship',
            content: 'No attorney-client relationship is established through the use of this website. The documents, templates, and analyses generated are not a substitute for professional legal advice. Laws and regulations vary across jurisdictions and are subject to change.'
        },
        {
            id: 'accuracy',
            title: 'Accuracy and Completeness',
            content: 'We do not guarantee the completeness, accuracy, or suitability of any content for your specific legal needs. You acknowledge that any reliance on the materials provided is at your own risk.'
        },
        {
            id: 'liability',
            title: 'Limitation of Liability',
            content: 'We disclaim all liability for any errors, omissions, or outcomes resulting from the use of this website. For legally binding advice and document validation, always consult a qualified legal professional.'
        },
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            content: 'By using this website, you agree to these terms and accept full responsibility for any decisions made based on the content provided.'
        }
    ];

    return (
        <div className={styles.container}>
            <Navbar />
            <motion.div
                className={styles.mainContent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.disclaimerContainer}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>Disclaimer</h1>
                        <p className={styles.effectiveDate}>Effective Date: 20/02/25</p>
                    </div>

                    <div className={styles.welcomeSection}>
                        <p>Welcome to Lawbit. This Disclaimer outlines important information about the use of our services and the limitations of our legal document tools.</p>
                    </div>

                    <div className={styles.sectionsContainer}>
                        {sections.map((section) => (
                            <div 
                                key={section.id}
                                className={cn(
                                    styles.section,
                                    { [styles.active]: activeSection === section.id }
                                )}
                            >
                                <div 
                                    className={styles.sectionHeader}
                                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                >
                                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                                    <svg 
                                        className={cn(
                                            styles.arrowIcon,
                                            { [styles.rotated]: activeSection === section.id }
                                        )}
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {activeSection === section.id && (
                                    <div className={styles.sectionContent}>
                                        <p>{section.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <p>By using Lawbit's website and services, you acknowledge that you have read, understood, and agreed to this Disclaimer.</p>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default Disclaimer; 