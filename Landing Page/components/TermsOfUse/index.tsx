'use client'

import { motion } from 'framer-motion';
import styles from './TermsOfUse.module.sass';
import Navbar from '../Navbar';
import Footer from '../Footer';

const TermsOfUse = () => {
    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: 'By using our services, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, you must discontinue use immediately.'
        },
        {
            id: 'use',
            title: '2. Use of Services',
            content: [
                'Eligibility: You must be at least 18 years old to use our services.',
                'Permitted Use: You may use our services only for lawful purposes and in accordance with these Terms.',
                'Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.'
            ]
        },
        {
            id: 'intellectual',
            title: '3. Intellectual Property Rights',
            content: [
                'All content, features, and functionality on our platform are owned by Lawbit and are protected by copyright, trademark, and other intellectual property laws.',
                'You may not reproduce, distribute, modify, or create derivative works without our prior written consent.'
            ]
        },
        {
            id: 'prohibited',
            title: '4. Prohibited Conduct',
            content: [
                'You agree not to use the services for any illegal or unauthorized purpose.',
                'You must not violate any applicable laws or regulations.',
                'Do not interfere with or disrupt the security of the services.',
                'Unauthorized access to any portion of our systems is strictly prohibited.'
            ]
        },
        {
            id: 'disclaimers',
            title: '5. Disclaimers and Limitation of Liability',
            content: [
                'No Warranty: Our services are provided "as is" without warranties of any kind, express or implied.',
                'No Guarantee: We do not guarantee outcomes from the use of our AI matching tool or CRM.',
                'Limitation of Liability: Lawbit shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.'
            ]
        },
        {
            id: 'indemnification',
            title: '6. Indemnification',
            content: 'You agree to indemnify and hold Lawbit, its affiliates, and employees harmless from any claims, losses, or damages resulting from your breach of these Terms or misuse of our services.'
        },
        {
            id: 'modifications',
            title: '7. Modifications to Terms',
            content: 'We reserve the right to update or modify these Terms of Use at any time. Changes will be effective upon posting on our website. Continued use of our services constitutes acceptance of the revised terms.'
        },
        {
            id: 'termination',
            title: '8. Termination',
            content: 'We may suspend or terminate your access to our services if you violate these Terms.'
        },
        {
            id: 'governing',
            title: '9. Governing Law and Dispute Resolution',
            content: [
                'These terms will be governed by and construed in accordance with the laws of India, and its jurisdiction lies in Pune, Maharashtra.',
                'Any dispute arising out from these terms shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, and both the parties will nominate one neutral arbitrator after the consent obtained by both the parties on the choice of the arbitrator. Arbitration Body located in Pune, Maharashtra.'
            ]
        },
        {
            id: 'contact',
            title: '10. Contact Information',
            content: ['If you have questions about these Terms of Use, please contact us at:', 'Email: support@neuralarc.ai']
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

                    <div className={styles.sectionsContainer}>
                        {sections.map((section) => (
                            <div key={section.id} className={styles.section}>
                                <h2 className={styles.sectionTitle}>{section.title}</h2>
                                <div className={styles.sectionContent}>
                                    {Array.isArray(section.content) ? (
                                        <ul className={styles.contentList}>
                                            {section.content.map((item, index) => (
                                                <li key={index} className={styles.contentItem}>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className={styles.contentText}>{section.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default TermsOfUse;