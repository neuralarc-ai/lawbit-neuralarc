import { useState } from 'react';
import cn from 'classnames';
import styles from './Dashboard.module.sass';
import CreateContract from '../CreateContract';
import AnalyzeContract from '../AnalyzeContract';

type TabType = 'create' | 'analyze';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('create');

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <img src="/images/logo.svg" alt="LawBit" />
                </div>
                <div className={styles.actions}>
                    <button className={styles.headerButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Import
                    </button>
                    <button className={styles.headerButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        New Contract
                    </button>
                    <button className={styles.headerButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 6V18M12 18L7 13M12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
            <div className={styles.container}>
                <div className={styles.tabsWrapper}>
                    <div className={styles.tabs} data-state={activeTab}>
                        <button
                            className={cn(styles.tab, {
                                [styles.active]: activeTab === 'create'
                            })}
                            onClick={() => setActiveTab('create')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Create
                        </button>
                        <button
                            className={cn(styles.tab, {
                                [styles.active]: activeTab === 'analyze'
                            })}
                            onClick={() => setActiveTab('analyze')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Analyze
                        </button>
                    </div>
                </div>
                <div className={styles.contentWrapper}>
                    <div className={styles.mainContent}>
                        {activeTab === 'create' ? <CreateContract /> : <AnalyzeContract />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 