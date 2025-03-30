import { useState } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';

type ContractData = {
    contractType: string;
    firstPartyName: string;
    secondPartyName: string;
    jurisdiction: string;
    keyTerms: string;
    description: string;
    intensity: 'Simple' | 'Moderate' | 'Watertight';
    preference: 'Option A' | 'Option B';
};

const CreateContract = () => {
    const [contractData, setContractData] = useState<ContractData>({
        contractType: '',
        firstPartyName: '',
        secondPartyName: '',
        jurisdiction: '',
        keyTerms: '',
        description: '',
        intensity: 'Simple',
        preference: 'Option A'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContractData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIntensityChange = (intensity: ContractData['intensity']) => {
        setContractData(prev => ({
            ...prev,
            intensity
        }));
    };

    const handlePreferenceChange = (preference: ContractData['preference']) => {
        setContractData(prev => ({
            ...prev,
            preference
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Contract Data:', contractData);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Contract type</label>
                        <input
                            type="text"
                            name="contractType"
                            value={contractData.contractType}
                            onChange={handleChange}
                            placeholder="Select contract type"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>First party name</label>
                        <input
                            type="text"
                            name="firstPartyName"
                            value={contractData.firstPartyName}
                            onChange={handleChange}
                            placeholder="Select contract type"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Second party name</label>
                        <input
                            type="text"
                            name="secondPartyName"
                            value={contractData.secondPartyName}
                            onChange={handleChange}
                            placeholder="Select contract type"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Jurisdiction</label>
                        <input
                            type="text"
                            name="jurisdiction"
                            value={contractData.jurisdiction}
                            onChange={handleChange}
                            placeholder="Select contract type"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Key Terms (Optional)</label>
                        <textarea
                            name="keyTerms"
                            value={contractData.keyTerms}
                            onChange={handleChange}
                            placeholder="Any key terms you'd like to specify"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Contract Description</label>
                        <textarea
                            name="description"
                            value={contractData.description}
                            onChange={handleChange}
                            placeholder="Describe what this contract should cover"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Contract Intensity</label>
                        <div className={styles.tabSelector}>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Simple'
                                })}
                                onClick={() => handleIntensityChange('Simple')}
                            >
                                Simple
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Moderate'
                                })}
                                onClick={() => handleIntensityChange('Moderate')}
                            >
                                Moderate
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Watertight'
                                })}
                                onClick={() => handleIntensityChange('Watertight')}
                            >
                                Watertight
                            </button>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Create Legal Draft
                    </button>
                </form>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.previewSection}>
                    <div className={styles.previewContent}>
                        <div className={styles.previewPlaceholder}>
                            <img src="/images/preview-icon.svg" alt="Preview" />
                        </div>
                    </div>
                </div>
                <div className={styles.actionsSection}>
                    <div className={styles.preferenceSelector}>
                        <label>Choose a preference</label>
                        <div className={styles.tabSelector}>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.preference === 'Option A'
                                })}
                                onClick={() => handlePreferenceChange('Option A')}
                            >
                                Option A
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.preference === 'Option B'
                                })}
                                onClick={() => handlePreferenceChange('Option B')}
                            >
                                Option B
                            </button>
                        </div>
                    </div>
                    <div className={styles.downloadButtons}>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3v10m0 0l-4-4m4 4l4-4m-10 7v4h12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 9h-4V5M5 15v4h4m10-4v4h-4M5 9h4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 5v14h12V5H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateContract; 