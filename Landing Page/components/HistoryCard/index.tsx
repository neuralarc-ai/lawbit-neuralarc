import React from 'react';
import styles from './HistoryCard.module.sass';
import cn from 'classnames';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type HistoryCardProps = {
    id: string;
    title: string;
    date: string;
    content: string;
    type: string;
    status: string;
    details: {
        contract_type: string;
        option: string;
        first_party: string;
        second_party: string;
        jurisdiction: string;
    };
    onPreview?: (id: string) => void;
};

const HistoryCard = ({
    id,
    title,
    date,
    content,
    type,
    status,
    details,
    onPreview
}: HistoryCardProps) => {
    const handleClick = () => {
        if (onPreview) {
            onPreview(id);
        }
    };

    return (
        <motion.div 
            className={styles.cardWrapper} 
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <Image src="/icons/document.svg" alt="icon" width={24} height={24} />
                    </div>
                    <div className={styles.typeBadge}>{type}</div>
                </div>

                <div className={styles.content}>
                    <h3>{title}</h3>
                    <p className={styles.date}>{date}</p>

                    <div className={styles.statusRow}>
                        <span className={styles.status}>{status}</span>
                        <div className={styles.option}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {details.option}
                        </div>
                    </div>

                    <div className={styles.parties}>
                        <div className={styles.party}>
                            <span className={styles.partyLabel}>First Party:</span>
                            <span className={styles.partyValue}>{details.first_party}</span>
                        </div>
                        <div className={styles.party}>
                            <span className={styles.partyLabel}>Second Party:</span>
                            <span className={styles.partyValue}>{details.second_party}</span>
                        </div>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.statsLabel}>Contract Details</div>
                        <div className={styles.statsTags}>
                            <span className={styles.statTag}>
                                <span className={styles.jurisdictionLabel}>Type:</span> {details.contract_type}
                            </span>
                            <span className={styles.statTag}>
                                <span className={styles.jurisdictionLabel}>Jurisdiction:</span> {details.jurisdiction}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HistoryCard; 