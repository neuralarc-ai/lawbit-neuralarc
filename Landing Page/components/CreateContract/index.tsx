import { useState } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';

type ContractData = {
    contractType: string;
    firstPartyName: string;
    secondPartyName: string;
    keyTerms: string;
    description: string;
};

const CreateContract = () => {
    const [contractData, setContractData] = useState<ContractData>({
        contractType: '',
        firstPartyName: '',
        secondPartyName: '',
        keyTerms: '',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContractData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle contract creation here
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
                        <label>Key Terms (Optional)</label>
                        <textarea
                            name="keyTerms"
                            value={contractData.keyTerms}
                            onChange={handleChange}
                            placeholder="Describe what this contract should cover"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Contract description</label>
                        <textarea
                            name="description"
                            value={contractData.description}
                            onChange={handleChange}
                            placeholder="Describe what this contract should cover"
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Create Document
                    </button>
                </form>
            </div>
            <div className={styles.previewSection}>
                <div className={styles.previewContent}>
                    <div className={styles.previewPlaceholder}>
                        <img src="/images/logo-gray.svg" alt="Preview" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateContract; 