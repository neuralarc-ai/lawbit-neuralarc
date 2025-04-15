import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './GenerateLegalDraft.module.sass';
import { generateContract, ContractResponse, saveContractToDatabase } from '@/services/contractService';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '../Toast/Toaster';
import { useSupabase } from '@/components/Providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import LegalDisclaimer from '../LegalDisclaimer'

const GenerateLegalDraft = () => {
    const { showToast } = useToast();
    const { user } = useSupabase();
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContract, setGeneratedContract] = useState<ContractResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generationStep, setGenerationStep] = useState(0);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [copySuccess, setCopySuccess] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const generationSteps = [
        "Generating...",
        "Structuring...",
        "Applying...",
        "Formatting...",
        "Finalizing..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGenerating) {
            interval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
                
                if (generationProgress < 20) setGenerationStep(0);
                else if (generationProgress < 40) setGenerationStep(1);
                else if (generationProgress < 60) setGenerationStep(2);
                else if (generationProgress < 80) setGenerationStep(3);
                else setGenerationStep(4);
            }, 50);
        } else {
            setGenerationProgress(0);
            setGenerationStep(0);
        }

        return () => clearInterval(interval);
    }, [isGenerating, generationProgress]);

    const handleGenerate = async () => {
        if (!disclaimerAccepted) {
            showToast('Please accept the legal disclaimer first');
            return;
        }
        if (!user) {
            showToast('Please sign in to generate a legal draft');
            router.push('/auth/signin');
            return;
        }

        if (!inputText.trim()) {
            showToast('Please enter your requirements');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('token_usage')
                .eq('id', user.id)
                .single();
            
            if (userError) {
                throw userError;
            }
            
            const tokenUsage = userData.token_usage as { total: number; used: number; remaining: number };
            
            if (tokenUsage.remaining < 10000) {
                const event = new CustomEvent('openSubscriptionModal');
                window.dispatchEvent(event);
                throw new Error('Insufficient tokens. Please upgrade your plan to continue.');
            }

            const contractData = {
                contractType: 'Custom Contract',
                firstPartyName: 'Party A',
                secondPartyName: 'Party B',
                jurisdiction: 'Default Jurisdiction',
                keyTerms: inputText,
                description: inputText,
                intensity: 'Moderate' as const,
                preference: 'Option A' as const
            };

            const response = await generateContract(contractData);
            setGeneratedContract(response);
            
            // Save to database
            await saveContractToDatabase(contractData, response.content, 'Option A');
            
            // Update token usage
            const { error: updateError } = await supabase.rpc('update_token_usage', {
                p_user_id: user.id,
                p_action: 'generate_contract',
                p_tokens: 10000
            });
            
            if (updateError) {
                console.error('Failed to update token usage:', updateError);
                showToast('Contract generated but failed to update token usage');
            }
            
            showToast('Legal draft generated successfully!');
            setShowPreview(true);
        } catch (err) {
            console.error('Error generating legal draft:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate legal draft');
            showToast(err instanceof Error ? err.message : 'Failed to generate legal draft');
        } finally {
            setIsGenerating(false);
        }
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
                        children: [
                            new TextRun({
                                text: generatedContract.content,
                                size: 24,
                                font: "Times New Roman"
                            })
                        ]
                    })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        // Format the filename with agreement type, date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const filename = `legal_draft-${date}-${time}.docx`;
        
        saveAs(blob, filename);
        showToast('Contract downloaded as DOCX');
    };

    const handleDownloadPDF = async () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        const pdf = new jsPDF();
        pdf.setFont("times", "normal");
        pdf.setFontSize(12);

        const splitText = pdf.splitTextToSize(generatedContract.content, 180);
        let yPosition = 20;

        splitText.forEach((line: string) => {
            if (yPosition > 280) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.text(line, 15, yPosition);
            yPosition += 7;
        });

        // Format the filename with agreement type, date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const filename = `legal_draft-${date}-${time}.pdf`;
        
        pdf.save(filename);
        showToast('Contract downloaded as PDF');
    };

    const handleCopyText = async () => {
        if (!generatedContract) {
            showToast('No contract to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(generatedContract.content);
            setCopySuccess(true);
            showToast('Contract copied to clipboard');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            showToast('Failed to copy contract');
        }
    };

    const formatContractContent = (content: string) => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Add date if not present in the content
        if (!content.includes('Date:')) {
            content = `Date: ${currentDate}\n\n${content}`;
        }
        
        return content;
    };

    return (
        <div className={styles.container}>
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.generatingOverlay}
                    >
                        <div className={styles.loadingIcon}>
                            <div className={styles.spinner} />
                            <Image
                                src="/icons/lawbit-preview.svg"
                                alt="Lawbit preview"
                                width={70}
                                height={70}
                                className={styles.logo}
                            />
                        </div>
                        <div className={styles.loadingText}>Generating your legal draft...</div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={styles.innerContainer}>
                <div className={styles.content}>
                    <h2 className={styles.title}>{showPreview ? 'Generated Legal Draft' : 'Generate Legal Draft'}</h2>
                    
            <AnimatePresence mode="wait">
                        {!showPreview ? (
                    <motion.div 
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                        <div className={styles.inputArea}>
                            <textarea
                                className={styles.textarea}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Describe your legal requirements here..."
                            />
                        </div>
                        
                        <div className={styles.legalDisclaimerContainer}>
                            <LegalDisclaimer 
                                onAccept={(value) => setDisclaimerAccepted(value)}
                                isAccepted={disclaimerAccepted}
                                isOpen={isDisclaimerOpen}
                                onToggle={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
                            />
                        </div>
                        
                            <button 
                                    className={cn(styles.generateButton, {
                                        [styles.loading]: isGenerating
                                    })}
                                onClick={handleGenerate}
                                    disabled={isGenerating || !disclaimerAccepted}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${generationProgress}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>
                                                {generationSteps[generationStep]}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Generate Legal Draft
                                            <svg 
                                                className={styles.arrowIcon}
                                                width="20" 
                                                height="20" 
                                                viewBox="0 0 20 20" 
                                                fill="none" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path 
                                                    d="M4.16666 10H15.8333M15.8333 10L10 4.16666M15.8333 10L10 15.8333" 
                                                    stroke="currentColor" 
                                                    strokeWidth="1.5" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </>
                                    )}
                            </button>
                    </motion.div>
                ) : (
                    <motion.div 
                                key="preview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={styles.previewContainer}
                            >
                                <div className={styles.previewContent}>
                                    <pre className={styles.contractText}>
                                        {generatedContract && formatContractContent(generatedContract.content)}
                                    </pre>
                            </div>
                                <div className={styles.previewActions}>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => setShowPreview(false)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <div className={styles.actions}>
                                    <button 
                                        className={cn(styles.actionButton, { [styles.disabled]: !generatedContract })}
                                        onClick={handleDownloadDOCX}
                                        disabled={!generatedContract}
                                    >
                                        <Image src="/icons/word.svg" alt="Word" width={24} height={24} />
                                    </button>
                                    <button 
                                        className={cn(styles.actionButton, { [styles.disabled]: !generatedContract })}
                                        onClick={handleDownloadPDF}
                                        disabled={!generatedContract}
                                    >
                                        <Image src="/icons/pdf.svg" alt="PDF" width={24} height={24} />
                                    </button>
                                    <button 
                                        className={cn(styles.actionButton, { [styles.disabled]: !generatedContract })}
                                        onClick={handleCopyText}
                                        disabled={!generatedContract}
                                    >
                                        {copySuccess ? (
                                            <Image 
                                                src="/icons/tick.svg" 
                                                alt="Copied" 
                                                width={24} 
                                                height={24} 
                                                className={styles.success}
                                                priority
                                            />
                                        ) : (
                                            <Image 
                                                src="/icons/copy.svg" 
                                                alt="Copy" 
                                                width={24} 
                                                height={24}
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>
                    </motion.div>
                )}
            </AnimatePresence>
                        </div>
                        </div>
        </div>
    );
};

export default GenerateLegalDraft; 