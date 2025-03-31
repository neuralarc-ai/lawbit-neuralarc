import React from 'react';
import styles from './HistoryCard.module.sass';
import cn from 'classnames';
import Image from 'next/image';

export type HistoryCardProps = {
    title: string;
    date: string;
    status: 'Completed';
    riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    riskScore: number;
    clausesCount: number;
    keyStats: {
        label: string;
        type: 'warning' | 'normal';
    }[];
    jurisdiction: string;
    moreCount?: number;
};

const HistoryCard = ({
    title,
    date,
    status,
    riskLevel,
    riskScore,
    clausesCount,
    keyStats,
    jurisdiction,
    moreCount = 3
}: HistoryCardProps) => {
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        <Image src="/icons/document.svg" alt="icon" width={24} height={24} />
                    </div>
                    <div className={styles.riskBadge}>{riskLevel}</div>
                </div>

                <div className={styles.content}>
                    <h3>{title}</h3>
                    <p className={styles.date}>{date}</p>

                    <div className={styles.statusRow}>
                        <span className={styles.status}>{status}</span>
                        <div className={styles.clauseCount}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {clausesCount} clauses identified
                        </div>
                    </div>

                    <div className={styles.riskScore}>
                        <div className={styles.scoreLabel}>Risk score</div>
                        <div className={styles.scoreValue}>{riskScore}%</div>
                        <div className={styles.scoreBar}>
                            <div 
                                className={styles.scoreProgress} 
                                style={{ width: `${riskScore}%` }}
                            />
                        </div>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.statsLabel}>Key Statistics</div>
                        <div className={styles.statsTags}>
                            {keyStats.map((stat, index) => (
                                <span 
                                    key={index} 
                                    className={cn(styles.statTag, {
                                        [styles.warning]: stat.type === 'warning'
                                    })}
                                >
                                    {stat.label}
                                </span>
                            ))}
                            <span className={styles.statTag}>
                                <span className={styles.jurisdictionLabel}>Jurisdiction:</span> {jurisdiction}
                            </span>
                            {moreCount > 0 && (
                                <span className={cn(styles.statTag, styles.moreTag)}>
                                    +{moreCount} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryCard; 