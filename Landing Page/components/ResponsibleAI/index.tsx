'use client'

import { useState } from 'react';
import cn from 'classnames';
import styles from './ResponsibleAI.module.sass';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

const ResponsibleAI = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const sections = [
        {
            id: 'intro',
            title: 'Responsible AI at Lawbit.ai',
            content: `Building Trustworthy Legal AI with Ethics at the Core

At Lawbit.ai, we believe that the transformative power of artificial intelligence must be grounded in responsibility, fairness, and transparency—especially when applied to the legal domain. As we develop AI tools that support legal analysis, compliance, and decision-making, we recognize the deep impact our technology can have on individuals, businesses, and the justice system.

Our commitment to Responsible AI is embedded in every stage of development—from data collection and model training to deployment and continuous monitoring. We align with global best practices, including the EU's Ethics Guidelines for Trustworthy AI and OECD AI Principles, while also staying mindful of local legal and regulatory contexts.`
        },
        {
            id: 'pillars',
            title: '⚖️ Our Responsible AI Pillars',
            content: ''
        },
        {
            id: 'human',
            title: '1. Human Agency & Oversight',
            content: `We design AI systems to augment, not replace, human legal expertise. Whether it's contract analysis or compliance recommendations, every AI-driven insight is subject to human review. Our tools are built with clear user controls, so professionals remain in charge of their decision-making processes.`
        },
        {
            id: 'fairness',
            title: '2. Fairness, Equity & Non-Discrimination',
            content: `Lawbit.ai is deeply committed to ensuring fair outcomes. We actively work to identify and mitigate biases in our data sources, algorithms, and outputs—understanding that legal decisions can have profound consequences on people's lives. We regularly audit models for disparate impact and retrain when necessary to uphold fairness and equity.`
        },
        {
            id: 'transparency',
            title: '3. Transparency & Explainability',
            content: `Legal professionals deserve clarity on how AI tools arrive at their recommendations. We prioritize explainable AI with features that provide context, citations, and step-by-step logic behind decisions. Our users can trace the flow of AI reasoning and understand what influenced each result.`
        },
        {
            id: 'privacy',
            title: '4. Privacy, Security & Data Governance',
            content: `As a legal technology provider, we handle sensitive data with the utmost care. Lawbit.ai implements end-to-end encryption, strict access controls, and anonymization protocols wherever applicable. We adhere to international data protection laws, including the GDPR and Indian DPDP Act, and are continuously improving our data governance framework.`
        },
        {
            id: 'technical',
            title: '5. Technical Robustness & Safety',
            content: `Our AI systems are stress-tested for edge cases and unexpected inputs. We maintain robust testing pipelines, fallback systems, and incident response mechanisms to ensure system reliability and user safety at all times.`
        },
        {
            id: 'accountability',
            title: '6. Accountability & Continuous Improvement',
            content: `We are accountable for the behavior and impact of our AI systems. Lawbit.ai regularly conducts internal audits, engages third-party evaluators when needed, and encourages user feedback to drive continuous improvement. Any unintended consequences are treated with urgency and transparency.`
        },
        {
            id: 'societal',
            title: '7. Societal Benefit & Accessibility',
            content: `We aim to democratize access to legal support through technology. Lawbit.ai's solutions are designed to reduce complexity, lower barriers to entry, and make compliance easier for startups, SMEs, and underserved communities. Responsible AI, for us, means making legal intelligence more inclusive, equitable, and beneficial to society as a whole.`
        },
        {
            id: 'commitment',
            title: '🌐 A Living Commitment',
            content: `Responsible AI at Lawbit.ai is not a one-time checklist—it's a living framework. As AI capabilities evolve and legal contexts shift, we continuously revisit our principles, tools, and processes to stay aligned with both ethical standards and real-world needs.

If you're a legal professional, researcher, or policymaker interested in how we approach Responsible AI—or want to collaborate on building a better standard for the industry—we'd love to hear from you.`
        },
        {
            id: 'contact',
            title: '📩 Contact Us',
            content: `Contact us at support@ampvc.co`
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
                <div className={styles.responsibleAIContainer}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.pageTitle}>Responsible AI</h1>
                        <p className={styles.effectiveDate}>Updated: February 2025</p>
                    </div>

                    {sections.map((section) => (
                        <div 
                            key={section.id}
                            className={cn(
                                styles.section,
                                { [styles.active]: activeSection === section.id || section.id === 'intro' }
                            )}
                        >
                            <div 
                                className={styles.sectionHeader}
                                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                            >
                                <h2 className={styles.sectionTitle}>{section.title}</h2>
                                {section.id !== 'intro' && section.id !== 'pillars' && (
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
                                )}
                            </div>
                            {(section.content.length > 0) && (
                                <div className={styles.sectionContent}>
                                    {section.content.split('\n\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default ResponsibleAI; 