'use client'

import styles from './Disclaimer.module.sass';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Disclaimer = () => {
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
                        <h1 className={styles.pageTitle}>Content Disclaimer</h1>
                        <p className={styles.effectiveDate}>Last Updated: May, 2025</p>
                    </div>

                    <div className={styles.contentSection}>
                        <p className={styles.contentText}>
                            At Lawbit, we are committed to delivering engaging, informative, and high-quality content. 
                            The material presented on this website—including articles, images, graphics, videos, and interactive 
                            media—is the result of collaboration between human creativity and the capabilities of advanced 
                            artificial intelligence (AI) technologies.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Our Approach to Content Creation</h2>
                        <div className={styles.sectionContent}>
                            <p className={styles.contentText}>
                                Our content is developed by experienced writers, editors, designers, and subject matter 
                                experts who use AI tools as part of their creative and research process. These tools help 
                                with generating ideas, analyzing data, drafting copy, proofreading, and enhancing visual content. 
                                However, all final outputs are reviewed, refined, and approved by human professionals before 
                                being published.
                            </p>
                            <p className={styles.contentText}>
                                AI contributes efficiency and scale, but it does not replace the human judgment, critical 
                                thinking, or ethical responsibility that underpins everything we create.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Understanding the Role and Limits of AI</h2>
                        <div className={styles.sectionContent}>
                            <p className={styles.contentText}>
                                While we use cutting-edge AI technologies designed to assist with content generation and 
                                optimization, it is important to acknowledge that AI is not infallible. AI systems can occasionally:
                            </p>
                            <ul className={styles.contentList}>
                                <li>Misinterpret context or nuance</li>
                                <li>Rely on outdated or incomplete information</li>
                                <li>Generate content that is factually incorrect or unintentionally biased</li>
                                <li>Miss subtleties that a human expert would catch</li>
                            </ul>
                            <p className={styles.contentText}>
                                Just as human-created content can contain mistakes, AI-assisted content may also reflect 
                                inaccuracies. We make every effort to identify and correct such issues, but we recognize 
                                that no system is perfect.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Encouraging Critical Engagement</h2>
                        <div className={styles.sectionContent}>
                            <p className={styles.contentText}>
                                We encourage our readers and users to engage with our content thoughtfully. If you are 
                                relying on information for important decisions—particularly in areas like health, finance, 
                                legal matters, or personal development—we strongly recommend that you consult with qualified 
                                professionals or conduct further independent research.
                            </p>
                            <p className={styles.contentText}>
                                Content on this site is intended to inform and inspire, but it should not be the sole 
                                basis for decisions involving risk or specialized knowledge.
                            </p>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>A Commitment to Transparency and Improvement</h2>
                        <div className={styles.sectionContent}>
                            <p className={styles.contentText}>
                                We strive for transparency in how our content is created and curated. We also believe in 
                                continuous improvement. Our team routinely updates published material to reflect new developments, 
                                correct any errors, and maintain overall relevance and accuracy.
                            </p>
                            <p className={styles.contentText}>
                                If you notice any content that you believe is outdated, inaccurate, misleading, or lacking 
                                important context, we genuinely appreciate your feedback. Your input helps us improve the quality 
                                and reliability of our platform for all users.
                            </p>
                            <p className={styles.contentText}>
                                Please feel free to contact us at{' '}
                                <a href="mailto:support@neuralarc.ai" className={styles.contactLink}>
                                    support@neuralarc.ai
                                </a>{' '}
                                if you have suggestions, questions, or corrections.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default Disclaimer;