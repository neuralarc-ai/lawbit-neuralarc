import React, { useState } from 'react';
import cn from 'classnames';
import styles from './Dashboard.module.sass';
import CreateContract from '../CreateContract';
import AnalyzeContract from '../AnalyzeContract';
import Image from 'next/image';

type TabType = 'create' | 'analyze';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('create');

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                <div className={styles.logoWrapper}>
                    <Image 
                        src="/icons/lawbit-logo.svg" 
                        alt="LawBit" 
                        width={120} 
                        height={40}
                        className={styles.logo}
                    />
                </div>

                <div className={styles.tabsWrapper}>
                    <div className={styles.tabs} data-state={activeTab}>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'create' })}
                            onClick={() => setActiveTab('create')}
                        >
                            <Image 
                                src="/icons/generated.svg" 
                                alt="Create" 
                                width={20} 
                                height={20}
                                className={styles.tabIcon}
                            />
                            Create Legal Draft
                        </button>
                        <button 
                            className={cn(styles.tab, { [styles.active]: activeTab === 'analyze' })}
                            onClick={() => setActiveTab('analyze')}
                        >
                            <Image 
                                src="/icons/analyzed.svg" 
                                alt="Analyze" 
                                width={20} 
                                height={20}
                                className={styles.tabIcon}
                            />
                            Analyze Legal Agreement
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