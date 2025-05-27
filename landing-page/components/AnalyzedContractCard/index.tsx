import React from 'react';
import styles from './AnalyzedContractCard.module.sass';
import cn from 'classnames';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type RiskLevel = 'High Risk' | 'Medium Risk' | 'Low Risk';

export interface AnalyzedContractCardProps {
    id: string;
    title: string;
    date: string;
    content: string;
    riskScore: number;
    riskLevel: RiskLevel;
    clausesIdentified: number;
    highRiskItems: number;
    onPreview: (id: string) => void;
}

const AnalyzedContractCard: React.FC<AnalyzedContractCardProps> = ({
    id,
    title,
    date,
    content,
    riskScore,
    riskLevel,
    clausesIdentified,
    highRiskItems,
    onPreview
}) => {
    const handleClick = () => {
        onPreview(id);
    };

    return (
        <motion.div 
            className={styles.cardWrapper}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
        >
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <Image 
                            src="/icons/analyzed.svg" 
                            alt="Analyzed" 
                            width={24} 
                            height={24}
                        />
                    </div>
                    <div className={styles.riskBadge}>
                        <span className={styles.riskScore}>{riskScore}%</span>
                        <span className={styles.riskLevel}>{riskLevel}</span>
                    </div>
                </div>
                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.date}>{date}</p>
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Clauses</span>
                            <span className={styles.statValue}>{clausesIdentified}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>High Risk Items</span>
                            <span className={styles.statValue}>{highRiskItems}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyzedContractCard; 