'use client'

import { motion } from 'framer-motion';
import styles from './PrivacyPolicy.module.sass';
import Navbar from '../Navbar';
import Footer from '../Footer';

const PrivacyPolicy = () => {
    const sections = [
        {
            id: 'information',
            title: '1. Information We Collect',
            content: [
                'Personal Information: When you register, contact us, or use our services, we collect information such as your name, email, phone number, and company details.',
                'Usage Data: We gather data on how you interact with our website, such as pages visited, time spent, and clicks, using cookies and analytics tools.',
                'AI Interaction Data: Information generated through your interactions with our AI tools, such as matching preferences or CRM usage patterns.'
            ]
        },
        {
            id: 'use',
            title: '2. How We Use Your Information',
            content: [
                'To provide and improve our services, including AI-powered matching and CRM functionalities.',
                'To communicate with you about updates, offers, and service enhancements.',
                'To conduct analytics and research to improve user experience.',
                'To maintain security and prevent fraud.',
                'To comply with legal obligations.'
            ]
        },
        {
            id: 'share',
            title: '3. How We Share Your Information',
            content: [
                'Robust Protection: We implement end-to-end encryption and secure data storage to protect user information from unauthorized access.',
                'Privacy by Design: Our AI tools comply with global standards such as GDPR, ensuring user data is handled with care and consent.',
                'Confidentiality Assurance: We never share proprietary data without explicit permission and use anonymized datasets for model training.'
            ]
        },
        {
            id: 'security',
            title: '4. Data Security',
            content: [
                'We use encryption, firewalls, and secure servers to protect your personal information.',
                'Access to your data is restricted to authorized personnel only.',
                'We regularly audit our systems for vulnerabilities and security breaches.'
            ]
        },
        {
            id: 'rights',
            title: '5. Your Rights',
            content: [
                'Access and Correction: You can access and update your personal information at any time.',
                'Data Deletion: You may request that we delete your personal data.',
                'Opt-Out: You can opt out of marketing communications.',
                'Consent Withdrawal: You may withdraw consent for data processing where applicable.'
            ]
        },
        {
            id: 'cookies',
            title: '6. Cookies and Tracking Technologies',
            content: [
                'We use cookies to enhance your experience and analyze site traffic.',
                'You can manage cookie preferences through your browser settings.'
            ]
        },
        {
            id: 'transfers',
            title: '7. International Data Transfers',
            content: 'If your information is transferred outside your country, we ensure appropriate safeguards are in place.'
        },
        {
            id: 'children',
            title: '8. Children\'s Privacy',
            content: 'Our services are not intended for children under 13, and we do not knowingly collect data from minors.'
        },
        {
            id: 'changes',
            title: '9. Changes to This Privacy Policy',
            content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on our website.'
        },
        {
            id: 'contact',
            title: '10. Contact Us',
            content: ['If you have any questions about this Privacy Policy, please contact us at:', 'Email: support@neuralarc.ai']
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
                <div className={styles.privacyContainer}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>Privacy Policy</h1>
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

export default PrivacyPolicy;