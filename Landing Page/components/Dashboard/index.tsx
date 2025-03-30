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
                <div className={styles.mainContent}>
                    {activeTab === 'create' ? <CreateContract /> : <AnalyzeContract />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 