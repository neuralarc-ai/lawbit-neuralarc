import { useState } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';
import { generateContract, ContractData, ContractResponse } from '@/services/contractService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

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

    const [generatedContract, setGeneratedContract] = useState<ContractResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContractData((prev: ContractData) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIntensityChange = (intensity: ContractData['intensity']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            intensity
        }));
    };

    const handlePreferenceChange = async (preference: ContractData['preference']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            preference
        }));

        // If we have a generated contract, regenerate it with the new preference
        if (generatedContract) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await generateContract({
                    ...contractData,
                    preference
                });
                setGeneratedContract(response);
            } catch (err) {
                setError('Failed to regenerate contract. Please try again.');
                console.error('Error regenerating contract:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await generateContract(contractData);
            setGeneratedContract(response);
        } catch (err) {
            setError('Failed to generate contract. Please try again.');
            console.error('Error generating contract:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!generatedContract) return;

        const doc = new jsPDF();
        const text = generatedContract.content;
        
        // Split the content into sections based on newlines
        const sections = text.split('\n\n');
        
        let yPos = 15;
        const leftMargin = 15;
        const rightMargin = 15;
        const maxWidth = doc.internal.pageSize.width - leftMargin - rightMargin;
        
        // Set default font size to 12pt
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        sections.forEach(section => {
            // Check if this is a heading (starts with SECTION, ARTICLE, etc.)
            if (section.match(/^(SECTION|ARTICLE|CHAPTER|PART)\s+/i)) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                const headingLines = doc.splitTextToSize(section, maxWidth);
                doc.text(headingLines, leftMargin, yPos);
                yPos += (headingLines.length * 8) + 5;
                // Reset font size back to 12pt for next section
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
            } 
            // Check if this is a list item
            else if (section.match(/^\s*[-•*]\s/)) {
                const bulletPoint = '• ';
                const listText = section.replace(/^\s*[-•*]\s/, '');
                const lines = doc.splitTextToSize(bulletPoint + listText, maxWidth - 10);
                doc.text(lines, leftMargin + 5, yPos);
                yPos += (lines.length * 7) + 3;
            }
            // Regular paragraph
            else {
                const lines = doc.splitTextToSize(section, maxWidth);
                doc.text(lines, leftMargin, yPos);
                yPos += (lines.length * 7) + 5;
            }

            // Check if we need a new page
            if (yPos > doc.internal.pageSize.height - 20) {
                doc.addPage();
                yPos = 15;
            }
        });
        
        doc.save('contract.pdf');
    };

    const handleDownloadDOCX = async () => {
        if (!generatedContract) return;

        const text = generatedContract.content;
        const sections = text.split('\n\n');
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: sections.map(section => {
                    // Check if this is a heading
                    if (section.match(/^(SECTION|ARTICLE|CHAPTER|PART)\s+/i)) {
                        return new Paragraph({
                            children: [
                                new TextRun({
                                    text: section,
                                    size: 28, // 14pt = 28 half-points
                                    bold: true,
                                    font: 'Calibri'
                                })
                            ],
                            spacing: {
                                after: 200,
                                before: 400
                            }
                        });
                    }
                    // Check if this is a list item
                    else if (section.match(/^\s*[-•*]\s/)) {
                        return new Paragraph({
                            children: [
                                new TextRun({
                                    text: '• ',
                                    size: 24, // 12pt = 24 half-points
                                    bold: true,
                                    font: 'Calibri'
                                }),
                                new TextRun({
                                    text: section.replace(/^\s*[-•*]\s/, ''),
                                    size: 24, // 12pt = 24 half-points
                                    font: 'Calibri'
                                })
                            ],
                            indent: {
                                left: 720 // 0.5 inch indent
                            },
                            spacing: {
                                after: 100,
                                before: 100
                            }
                        });
                    }
                    // Regular paragraph
                    else {
                        return new Paragraph({
                            children: [
                                new TextRun({
                                    text: section,
                                    size: 24, // 12pt = 24 half-points
                                    font: 'Calibri'
                                })
                            ],
                            spacing: {
                                after: 200,
                                before: 200
                            }
                        });
                    }
                })
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, 'contract.docx');
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
                            className={styles.select}
                        >
                            <option value="">Select contract type</option>
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
                            placeholder="Enter first party name"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>First party address (Optional)</label>
                        <textarea
                            name="firstPartyAddress"
                            value={contractData.firstPartyAddress}
                            onChange={handleChange}
                            placeholder="Enter first party address"
                            className={styles.addressInput}
                            rows={3}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Second party name</label>
                        <input
                            type="text"
                            name="secondPartyName"
                            value={contractData.secondPartyName}
                            onChange={handleChange}
                            placeholder="Enter second party name"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Second party address (Optional)</label>
                        <textarea
                            name="secondPartyAddress"
                            value={contractData.secondPartyAddress}
                            onChange={handleChange}
                            placeholder="Enter second party address"
                            className={styles.addressInput}
                            rows={3}
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
                        {isLoading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>Generating contract...</p>
                            </div>
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
                                        height: '1160px',
                                        width: '100%',
                                        overflowY: 'auto',
                                        boxSizing: 'border-box'
                                    }}>
                                        {generatedContract.content}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                        <div className={styles.previewPlaceholder}>
                            <img src="/images/preview-icon.svg" alt="Preview" />
                        </div>
                        )}
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
                                <button type="button" className={styles.iconButton} onClick={handleDownloadPDF}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3v10m0 0l-4-4m4 4l4-4m-10 7v4h12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton} onClick={handleDownloadDOCX}>
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