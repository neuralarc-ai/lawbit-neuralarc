import { useState } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';
import { generateContract, ContractData, ContractResponse, saveContractToDatabase } from '@/services/contractService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast/Toaster';
import { z } from 'zod';
import { useSupabase } from '@/components/Providers/SupabaseProvider';
import { useRouter } from 'next/navigation';

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
    'License Agreement',
    'Franchise Agreement',
    'Joint Venture Agreement',
    'Distribution Agreement',
    'Supply Agreement',
    'Confidentiality Agreement',
    'Settlement Agreement',
    'Loan Agreement',
    'Insurance Contract',
    'Real Estate Purchase Agreement',
    'Construction Contract',
    'Software License Agreement',
    'Trademark License Agreement',
    'Patent License Agreement',
    'Merger Agreement',
    'Acquisition Agreement',
    'Shareholder Agreement',
    'Operating Agreement',
    'Subscription Agreement',
    'Sponsorship Agreement',
    'Event Contract',
    'Photography Contract',
    'Freelance Agreement'
];

interface FormattedContentItem {
    type: 'heading1' | 'heading2' | 'listItem' | 'keyValue' | 'paragraph' | 'numberedSection';
    text?: string;
    key?: string;
    value?: string;
    level?: number;
    number?: string;
}

const CreateContract = () => {
    const { showToast } = useToast();
    const { user } = useSupabase();
    const router = useRouter();
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
        
        if (!user) {
            showToast('Please sign in to create a contract');
            router.push('/auth/signin');
            return;
        }
        
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

    // Process content to detect formatting
    const processContent = (text: string): FormattedContentItem[] => {
        // Split by newlines to preserve paragraph structure
        const paragraphs = text.split('\n\n');
        
        return paragraphs.map(paragraph => {
            // Trim whitespace
            const trimmedParagraph = paragraph.trim();
            
            // Skip empty paragraphs
            if (!trimmedParagraph) {
                return { type: 'paragraph', text: '' };
            }
            
            // Check if this is a heading (starts with # or ##)
            if (trimmedParagraph.startsWith('# ')) {
                return { type: 'heading1', text: trimmedParagraph.substring(2) };
            } else if (trimmedParagraph.startsWith('## ')) {
                return { type: 'heading2', text: trimmedParagraph.substring(3) };
            } 
            // Check if this is a list item
            else if (trimmedParagraph.startsWith('- ') || trimmedParagraph.startsWith('* ')) {
                return { type: 'listItem', text: trimmedParagraph.substring(2) };
            }
            // Check if this is a key-value pair (e.g., "Key: Value")
            else if (trimmedParagraph.includes(': ')) {
                const [key, value] = trimmedParagraph.split(': ');
                return { type: 'keyValue', key, value };
            }
            // Check for numbered sections (e.g., "1.1. Position", "1.2. Duties")
            else if (/^\d+(\.\d+)*\.\s/.test(trimmedParagraph)) {
                const match = trimmedParagraph.match(/^(\d+(\.\d+)*)\.\s(.*)/);
                if (match) {
                    const number = match[1];
                    const text = match[3];
                    // Calculate level based on number of dots
                    const level = number.split('.').length;
                    return { 
                        type: 'numberedSection', 
                        text, 
                        number, 
                        level 
                    };
                }
            }
            // Check for section headers (all caps)
            else if (/^[A-Z\s]+$/.test(trimmedParagraph) && trimmedParagraph.length > 3) {
                return { type: 'heading1', text: trimmedParagraph };
            }
            // Regular paragraph
            else {
                return { type: 'paragraph', text: trimmedParagraph };
            }
            
            // Default case - should never reach here, but TypeScript needs it
            return { type: 'paragraph', text: trimmedParagraph };
        });
    };

    // Function to generate a descriptive contract title
    const generateContractTitle = () => {
        if (!contractData.contractType || !contractData.firstPartyName || !contractData.secondPartyName) {
            return 'Generated Contract';
        }
        
        // Format the contract type (remove "Contract" if it's at the end)
        let formattedType = contractData.contractType;
        if (formattedType.endsWith(' Contract')) {
            formattedType = formattedType.replace(' Contract', '');
        }
        
        // Create a descriptive title
        return `${formattedType} between ${contractData.firstPartyName} and ${contractData.secondPartyName}`;
    };

    const handleDownloadPDF = () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        const doc = new jsPDF();
        
        // Set margins
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);
        
        // Add title
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        const title = generateContractTitle();
        const titleLines = doc.splitTextToSize(title, contentWidth);
        doc.text(titleLines, pageWidth / 2, margin, { align: 'center' });
        
        // Process content for formatting
        const formattedContent = processContent(generatedContract.content);
        
        // Calculate starting Y position after title
        let yPosition = margin + (titleLines.length * 7) + 10;
        
        // Add each paragraph with proper formatting
        formattedContent.forEach(item => {
            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            switch (item.type) {
                case 'heading1':
                    doc.setFontSize(16);
                    doc.setFont('times', 'bold');
                    const heading1Lines = doc.splitTextToSize(item.text || '', contentWidth);
                    doc.text(heading1Lines, margin, yPosition);
                    yPosition += (heading1Lines.length * 7) + 5;
                    break;
                    
                case 'heading2':
                    doc.setFontSize(14);
                    doc.setFont('times', 'bold');
                    const heading2Lines = doc.splitTextToSize(item.text || '', contentWidth);
                    doc.text(heading2Lines, margin, yPosition);
                    yPosition += (heading2Lines.length * 7) + 5;
                    break;
                    
                case 'listItem':
                    doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    const listItemText = '• ' + (item.text || '');
                    const listItemLines = doc.splitTextToSize(listItemText, contentWidth - 5);
                    doc.text(listItemLines, margin + 5, yPosition);
                    yPosition += (listItemLines.length * 7) + 3;
                    break;
                    
                case 'numberedSection':
                    doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    
                    // Calculate indentation based on level
                    const indent = item.level ? (item.level - 1) * 10 : 0;
                    const availableWidth = contentWidth - indent;
                    
                    // Add the number and text
                    const numberText = (item.number || '') + '. ';
                    const sectionText = item.text || '';
                    const fullText = numberText + sectionText;
                    
                    // Split text to fit within available width
                    const sectionLines = doc.splitTextToSize(fullText, availableWidth);
                    
                    // If the number is long, we might need to handle it differently
                    if (numberText.length > 5) {
                        // First line: number
                        doc.text(numberText, margin + indent, yPosition);
                        
                        // Remaining lines: text with proper indentation
                        const remainingText = sectionText;
                        const remainingLines = doc.splitTextToSize(remainingText, availableWidth - 10);
                        doc.text(remainingLines, margin + indent + 10, yPosition + 7);
                        yPosition += 7 + (remainingLines.length * 7) + 3;
                    } else {
                        // Simple case: just add the text with the number
                        doc.text(sectionLines, margin + indent, yPosition);
                        yPosition += (sectionLines.length * 7) + 3;
                    }
                    break;
                    
                case 'keyValue':
                    doc.setFontSize(12);
                    doc.setFont('times', 'bold');
                    const keyText = (item.key || '') + ': ';
                    const valueText = item.value || '';
                    
                    // Check if key is too long to fit on one line
                    const keyWidth = doc.getStringUnitWidth(keyText) * 12;
                    if (keyWidth > contentWidth / 2) {
                        // Key is too long, put it on its own line
                        const keyLines = doc.splitTextToSize(keyText, contentWidth);
                        doc.text(keyLines, margin, yPosition);
                        yPosition += (keyLines.length * 7);
                        
                        // Then add the value on the next line
                        doc.setFont('times', 'normal');
                        const valueLines = doc.splitTextToSize(valueText, contentWidth);
                        doc.text(valueLines, margin, yPosition);
                        yPosition += (valueLines.length * 7) + 3;
                    } else {
                        // Key fits on one line, use the original approach
                        doc.text(keyText, margin, yPosition);
                        doc.setFont('times', 'normal');
                        const valueLines = doc.splitTextToSize(valueText, contentWidth - keyWidth - 10);
                        doc.text(valueLines, margin + keyWidth + 10, yPosition);
                        yPosition += Math.max(7, valueLines.length * 7) + 3;
                    }
                    break;
                    
                case 'paragraph':
                default:
        doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    const lines = doc.splitTextToSize(item.text || '', contentWidth);
                    lines.forEach((line: string) => {
                        if (yPosition > pageHeight - margin) {
                            doc.addPage();
                            yPosition = margin;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 7;
                    });
                    yPosition += 3; // Add extra space after paragraphs
                    break;
            }
        });
        
        // Generate a filename based on the contract title
        const filename = generateContractTitle().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.pdf';
        doc.save(filename);
        showToast('Contract downloaded as PDF');
    };

    const handleDownloadDOCX = async () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        // Process content for formatting
        const formattedContent = processContent(generatedContract.content);
        
        // Create document with proper formatting
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch in twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                            header: 720,
                            footer: 720,
                            gutter: 0
                        }
                    }
                },
                children: [
                    new Paragraph({
                        text: generateContractTitle(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400
                        }
                    }),
                    ...formattedContent.map(item => {
                        switch (item.type) {
                            case 'heading1':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            bold: true,
                                            size: 32, // 16pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 240,
                                        after: 120
                                    }
                                });
                                
                            case 'heading2':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            bold: true,
                                            size: 28, // 14pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 240,
                                        after: 120
                                    }
                                });
                                
                            case 'listItem':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "• ",
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.text || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    indent: {
                                        left: 720 // 0.5 inch
                                    },
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'numberedSection':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (item.number || '') + '. ',
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.text || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    indent: {
                                        left: item.level ? (item.level - 1) * 720 : 0 // 0.5 inch per level
                                    },
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'keyValue':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (item.key || '') + ": ",
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.value || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'paragraph':
                            default:
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            size: 24, // 12pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        line: 360, // 1.5 line spacing
                                        before: 120,
                                        after: 120
                                    }
                                });
                        }
                    })
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        // Generate a filename based on the contract title
        const filename = generateContractTitle().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.docx';
        saveAs(blob, filename);
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
                            ) : generatedContract ? (
                                <motion.div 
                                    className={styles.contractPreview}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.contractContent}>
                                        <h1 className={styles.heading1}>{generateContractTitle()}</h1>
                                        {processContent(generatedContract.content).map((item, index) => {
                                            switch (item.type) {
                                                case 'heading1':
                                                    return (
                                                        <h1 key={index} className={styles.heading1}>
                                                            {item.text}
                                                        </h1>
                                                    );
                                                case 'heading2':
                                                    return (
                                                        <h2 key={index} className={styles.heading2}>
                                                            {item.text}
                                                        </h2>
                                                    );
                                                case 'listItem':
                                                    return (
                                                        <div key={index} className={styles.listItem}>
                                                            <span className={styles.bullet}>•</span>
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                case 'numberedSection':
                                                    return (
                                                        <div 
                                                            key={index} 
                                                            className={styles.numberedSection}
                                                            style={{ 
                                                                marginLeft: `${(item.level || 1) * 20}px`,
                                                                paddingLeft: '10px'
                                                            }}
                                                        >
                                                            <span className={styles.number}>{item.number}.</span>
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                case 'keyValue':
                                                    return (
                                                        <div key={index} className={styles.keyValue}>
                                                            <span className={styles.key}>{item.key}:</span>
                                                            <span className={styles.value}>{item.value}</span>
                                                        </div>
                                                    );
                                                case 'paragraph':
                                                default:
                                                    return (
                                                        <p key={index} className={styles.paragraph}>
                                                            {item.text}
                                                        </p>
                                                    );
                                            }
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className={styles.previewPlaceholder}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Image 
                                        src="/icons/lawbit-preview.svg" 
                                        alt="Contract Preview" 
                                        width={120} 
                                        height={120}
                                        className={styles.previewIcon}
                                    />
                                    <p className={styles.placeholderText}>
                                        Your generated contract will appear here
                                    </p>
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