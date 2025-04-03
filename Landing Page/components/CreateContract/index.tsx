import { useState } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';
import { generateContract, ContractData, ContractResponse, saveContractToDatabase } from '@/services/contractService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast/Toaster';
import { z } from 'zod';

const contractSchema = z.object({
    contractType: z.string().min(1, 'Contract type is required'),
    firstPartyName: z.string().min(1, 'First party name is required'),
    firstPartyAddress: z.string().optional(),
    secondPartyName: z.string().min(1, 'Second party name is required'),
    secondPartyAddress: z.string().optional(),
    jurisdiction: z.string().min(1, 'Jurisdiction is required'),
    keyTerms: z.string().optional(),
    description: z.string().min(1, 'Contract description is required'),
    intensity: z.enum(['Simple', 'Moderate', 'Watertight']),
    preference: z.enum(['Option A', 'Option B'])
});

const contractTypes = [
    'Employment Contract',
    'Non-Disclosure Agreement',
    'Service Agreement',
    'Lease Agreement',
    'Sales Contract',
    'Partnership Agreement',
    'Consulting Agreement',
    'License Agreement'
];

const CreateContract = () => {
    const { showToast } = useToast();
    const [contractData, setContractData] = useState<ContractData>({
        contractType: '',
        firstPartyName: '',
        firstPartyAddress: '',
        secondPartyName: '',
        secondPartyAddress: '',
        jurisdiction: '',
        keyTerms: '',
        description: '',
        intensity: 'Simple',
        preference: 'Option A'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generatedContract, setGeneratedContract] = useState<ContractResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enabledOptionalFields, setEnabledOptionalFields] = useState<{
        firstPartyAddress: boolean;
        secondPartyAddress: boolean;
        keyTerms: boolean;
    }>({
        firstPartyAddress: false,
        secondPartyAddress: false,
        keyTerms: false
    });

    // Add new state for storing contracts by option
    const [contractsByOption, setContractsByOption] = useState<{
        'Option A': ContractResponse | null;
        'Option B': ContractResponse | null;
    }>({
        'Option A': null,
        'Option B': null
    });

    const toggleOptionalField = (field: keyof typeof enabledOptionalFields) => {
        setEnabledOptionalFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateField = (name: string, value: string) => {
        try {
            contractSchema.shape[name as keyof typeof contractSchema.shape].parse(value);
            setErrors(prev => ({ ...prev, [name]: '' }));
        } catch (err) {
            if (err instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [name]: err.errors[0].message }));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContractData((prev: ContractData) => ({
            ...prev,
            [name]: value
        }));
        validateField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleIntensityChange = (intensity: ContractData['intensity']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            intensity
        }));
        validateField('intensity', intensity);
    };

    // Function to store contract in browser storage
    const storeContract = (option: 'Option A' | 'Option B', contract: ContractResponse) => {
        const storageKey = `contract_${contractData.contractType}_${option}`;
        localStorage.setItem(storageKey, JSON.stringify(contract));
        setContractsByOption(prev => ({
            ...prev,
            [option]: contract
        }));
    };

    // Function to retrieve contract from browser storage
    const getStoredContract = (option: 'Option A' | 'Option B'): ContractResponse | null => {
        const storageKey = `contract_${contractData.contractType}_${option}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    };

    // Update handlePreferenceChange to handle both options properly
    const handlePreferenceChange = async (preference: ContractData['preference']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            preference
        }));
        validateField('preference', preference);

        // Check if we have a stored contract for this option
        const storedContract = getStoredContract(preference);
        if (storedContract) {
            setGeneratedContract(storedContract);
            return;
        }

        // If no stored contract, generate a new one
        setIsLoading(true);
        setError(null);
        try {
            const response = await generateContract({
                ...contractData,
                preference
            });
            setGeneratedContract(response);
            storeContract(preference, response);
            
            // Save to database
            await saveContractToDatabase(contractData, response.content, preference);
            showToast(`Contract generated successfully for ${preference}!`);
        } catch (err) {
            setError('Failed to generate contract. Please try again.');
            showToast('Failed to generate contract. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Update handleSubmit to generate both options
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            contractSchema.parse(contractData);
            setIsLoading(true);
            setError(null);

            // Generate contract for current option
            const response = await generateContract(contractData);
            setGeneratedContract(response);
            storeContract(contractData.preference, response);
            
            // Save current option to database
            await saveContractToDatabase(contractData, response.content, contractData.preference);

            // Generate and save the other option
            const otherOption = contractData.preference === 'Option A' ? 'Option B' : 'Option A';
            const otherResponse = await generateContract({
                ...contractData,
                preference: otherOption
            });
            storeContract(otherOption, otherResponse);
            await saveContractToDatabase(contractData, otherResponse.content, otherOption);
            
            showToast('Contracts generated successfully for both options!');
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const newErrors: { [key: string]: string } = {};
                err.errors.forEach((error: z.ZodIssue) => {
                    if (error.path[0]) {
                        newErrors[error.path[0] as string] = error.message;
                    }
                });
                setErrors(newErrors);
                showToast('Please fill in all required fields correctly');
            } else {
                setError('Failed to generate contract. Please try again.');
                showToast('Failed to generate contract. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Generated Contract', 20, 20);
        doc.setFontSize(12);
        doc.text(generatedContract.content, 20, 40);
        doc.save('generated-contract.pdf');
        showToast('Contract downloaded as PDF');
    };

    const handleDownloadDOCX = async () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: generatedContract.content,
                        heading: HeadingLevel.HEADING_1,
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, 'generated-contract.docx');
        showToast('Contract downloaded as DOCX');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Text copied to clipboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Contract type</label>
                        <select
                            name="contractType"
                            value={contractData.contractType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cn(styles.select, { [styles.error]: errors.contractType })}
                        >
                            <option value="">{errors.contractType || "Select contract type"}</option>
                            {contractTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label>First party name</label>
                        <input
                            type="text"
                            name="firstPartyName"
                            value={contractData.firstPartyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.firstPartyName || "Enter first party name"}
                            className={cn({ [styles.error]: errors.firstPartyName })}
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.firstPartyAddress}
                                onChange={() => toggleOptionalField('firstPartyAddress')}
                            />
                            <label>First party address (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.firstPartyAddress
                        })}>
                            <textarea
                                name="firstPartyAddress"
                                value={contractData.firstPartyAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={errors.firstPartyAddress || "Enter first party address"}
                                className={cn(styles.addressInput, { 
                                    [styles.error]: errors.firstPartyAddress
                                })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Second party name</label>
                        <input
                            type="text"
                            name="secondPartyName"
                            value={contractData.secondPartyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.secondPartyName || "Enter second party name"}
                            className={cn({ [styles.error]: errors.secondPartyName })}
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.secondPartyAddress}
                                onChange={() => toggleOptionalField('secondPartyAddress')}
                            />
                            <label>Second party address (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.secondPartyAddress
                        })}>
                            <textarea
                                name="secondPartyAddress"
                                value={contractData.secondPartyAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={errors.secondPartyAddress || "Enter second party address"}
                                className={cn(styles.addressInput, { 
                                    [styles.error]: errors.secondPartyAddress
                                })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Jurisdiction</label>
                        <input
                            type="text"
                            name="jurisdiction"
                            value={contractData.jurisdiction}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.jurisdiction || "Select contract type"}
                            className={cn({ [styles.error]: errors.jurisdiction })}
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.keyTerms}
                                onChange={() => toggleOptionalField('keyTerms')}
                            />
                            <label>Key Terms (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.keyTerms
                        })}>
                            <textarea
                                name="keyTerms"
                                value={contractData.keyTerms}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={errors.keyTerms || "Any key terms you'd like to specify"}
                                className={cn({ 
                                    [styles.error]: errors.keyTerms
                                })}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Contract Description</label>
                        <textarea
                            name="description"
                            value={contractData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.description || "Describe what this contract should cover"}
                            className={cn({ [styles.error]: errors.description })}
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
                        <span>Create Legal Draft</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.previewSection}>
                    <div className={styles.previewContent}>
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div 
                                    className={styles.loading}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        <Image 
                                            src="/icons/lawbit-preview.svg" 
                                            alt="LawBit Logo" 
                                            width={120} 
                                            height={120} 
                                            className={styles.logo}
                                        />
                                    </motion.div>
                                    <motion.div 
                                        className={styles.loadingText}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.3 }}
                                    >
                                        Generating...
                                    </motion.div>
                                </motion.div>
                            ) : error ? (
                                <div className={styles.error}>
                                    <p>{error}</p>
                                </div>
                            ) : generatedContract ? (
                                <div className={styles.contractPreview}>
                                    <div className={styles.contractContent}>
                                        <pre style={{ 
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: 'inherit',
                                            fontSize: '14px',
                                            lineHeight: '1.8',
                                            padding: '20px',
                                            margin: '0',
                                            backgroundColor: '#1A1A1A',
                                            color: '#FFFFFF',
                                            letterSpacing: '0.2px',
                                            textAlign: 'left',
                                            maxHeight: '1160px',
                                            width: '100%',
                                            overflowY: 'auto',
                                            boxSizing: 'border-box'
                                        }}>
                                            {generatedContract.content}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                            <motion.div 
                                className={styles.previewPlaceholder}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Image 
                                        src="/icons/lawbit-preview.svg" 
                                        alt="Preview" 
                                        width={120} 
                                        height={120}
                                        className={styles.previewIcon} 
                                    />
                                </motion.div>
                                <motion.div 
                                    className={styles.placeholderText}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 0.6, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    This is where your results will appear...
                                </motion.div>
                            </motion.div>
                            )}
                        </AnimatePresence>
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
                                <button type="button" className={styles.iconButton} onClick={handleDownloadDOCX}>
                                    <Image src="/icons/word.svg" alt="Word" width={24} height={24} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton} onClick={handleDownloadPDF}>
                                    <Image src="/icons/pdf.svg" alt="PDF" width={24} height={24} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton} onClick={() => copyToClipboard(generatedContract?.content || '')}>
                                    <Image src="/icons/copy.svg" alt="Copy" width={24} height={24} />
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