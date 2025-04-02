'use client'

import { useState } from 'react';
import cn from 'classnames';
import styles from './TermsOfUse.module.sass';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

const TermsOfUse = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const sections = [
        {
            id: 'acceptance',
            title: 'Acceptance of Terms',
            content: 'By using our services, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, you must discontinue use immediately.'
        },
        {
            id: 'use',
            title: 'Use of Services',
            content: `Eligibility: You must be at least 18 years old to use our services.

Permitted Use: You may use our services only for lawful purposes and in accordance with these Terms.

Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.`
        },
        {
            id: 'intellectual',
            title: 'Intellectual Property Rights',
            content: `Eligibility: You must be at least 18 years old to use our services.

Permitted Use: You may use our services only for lawful purposes and in accordance with these Terms.

Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.`
        },
        {
            id: 'prohibited',
            title: 'Prohibited Conduct',
            content: `You agree not to:

Use the services for any illegal or unauthorized purpose.

Violate any applicable laws or regulations.

Interfere with or disrupt the security of the services.

Attempt to gain unauthorized access to any portion of our systems.`
        },
        {
            id: 'disclaimers',
            title: 'Disclaimers and Limitation of Liability',
            content: `No Warranty: Our services are provided "as is" without warranties of any kind, express or implied.

No Guarantee: We do not guarantee outcomes from the use of our AI matching tool or CRM.

Limitation of Liability: Lawbit shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.`
        },
        {
            id: 'indemnification',
            title: 'Indemnification',
            content: 'You agree to indemnify and hold Lawbit, its affiliates, and employees harmless from any claims, losses, or damages resulting from your breach of these Terms or misuse of our services.'
        },
        {
            id: 'modifications',
            title: 'Modifications to Terms',
            content: 'We reserve the right to update or modify these Terms of Use at any time. Changes will be effective upon posting on our website. Continued use of our services constitutes acceptance of the revised terms.'
        },
        {
            id: 'termination',
            title: 'Termination',
            content: 'We may suspend or terminate your access to our services if you violate these Terms.'
        },
        {
            id: 'governing',
            title: 'Governing Law and Dispute Resolution',
            content: `These terms will be governed by and construed in accordance with the laws of India, and its jurisdiction lies in Pune, Maharashtra.

Any dispute arising out from these terms shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, and both the parties will nominate one neutral arbitrator after the consent obtained by both the parties on the choice of the arbitrator. Arbitration Body located in Pune, Maharashtra.`
        },
        {
            id: 'contact',
            title: 'Contact Information',
            content: `If you have questions about these Terms of Use, please contact us at:

Email: support@ampvc.co`
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
                <div className={styles.termsContainer}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>Terms of Use</h1>
                        <p className={styles.effectiveDate}>Effective Date: 20/02/25</p>
                    </div>

                    <div className={styles.welcomeSection}>
                        <p>Welcome to Lawbit, a product of NeuralPaths. By accessing or using our website and services, you agree to comply with these Terms of Use. Please read them carefully.</p>
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
                                <div className={styles.sectionContent}>
                                    {section.content.split('\n\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <p>By using Lawbit's website and services, you acknowledge that you have read, understood, and agreed to these Terms of Use.</p>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default TermsOfUse; 