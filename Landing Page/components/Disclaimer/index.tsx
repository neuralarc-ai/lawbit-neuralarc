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
            <div style={{ marginTop: '40px' }}></div>
            <motion.div
                className={styles.mainContent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.disclaimerContainer}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>AI Enabled Content Notice</h1>
                        <p className={styles.effectiveDate}>Updated: April 2025</p>
                    </div>

                    <div className={styles.contentSection}>
                        <p>
                            This website features content, including text, images, and other media, created by humans (us!) with the assistance of advanced artificial intelligence (AI) technologies.
                        </p>
                        <p>
                            While we work hard to ensure the information is accurate, relevant, and high-quality, it&apos;s important to note that AI tools, while sophisticated, are not flawless and may occasionally generate content that is incorrect, incomplete, or imperfect—just like humans.
                        </p>
                        <p>
                            We encourage critical thinking and recommend independently verifying any information when needed. Though we strive to update and improve content as necessary, there may be instances where outdated or inaccurate information remains. If you come across any errors, we&apos;d love to hear from you!
                        </p>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default Disclaimer; 