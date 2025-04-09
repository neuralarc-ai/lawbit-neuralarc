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

    const generationSteps = [
        "Analyzing your requirements...",
        "Structuring the legal document...",
        "Applying legal terminology...",
        "Formatting the document...",
        "Finalizing your draft..."
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
            // Show error or notification that user needs to accept disclaimer
            return
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
            
            const tokenUsage = userData.token_usage as { total: number; limit: number; remaining: number };
            
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

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <AnimatePresence mode="wait">
                    {!generatedContract ? (
                        <motion.div 
                            className={styles.content}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h2 className={styles.title}>Enter Your Details</h2>
                            
                            <div className={styles.inputArea}>
                                <textarea
                                    className={styles.textarea}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Start Typing... Describe your legal requirements in detail. For example: I need a contract for a software development project where I will be hiring a freelance developer for 6 months..."
                                />
                            </div>
                            
                            <LegalDisclaimer 
                                onAccept={setDisclaimerAccepted}
                                isAccepted={disclaimerAccepted}
                            />
                            
                            <div className={styles.actionsRow}>
                                <button 
                                    onClick={handleGenerate}
                                    className={cn(styles.generateButton, { 
                                        [styles.generating]: isGenerating,
                                        [styles.disabled]: !disclaimerAccepted
                                    })}
                                    disabled={isGenerating || !inputText.trim() || !disclaimerAccepted}
                                >
                                    Generate Legal Draft &nbsp;→
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            className={styles.content}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className={styles.resultSection}>
                                <h2 className={styles.title}>Generated Legal Draft</h2>
                                <div className={styles.contractContent}>
                                    {generatedContract.content}
                                </div>
                                <div className={styles.downloadSection}>
                                    <button 
                                        onClick={handleDownloadPDF}
                                        className={styles.actionButton}
                                    >
                                        <Image 
                                            src="/icons/pdf.svg" 
                                            alt="PDF" 
                                            width={20} 
                                            height={20}
                                        />
                                        Download PDF
                                    </button>
                                    <button 
                                        onClick={handleDownloadDOCX}
                                        className={styles.actionButton}
                                    >
                                        <Image 
                                            src="/icons/word.svg" 
                                            alt="Word" 
                                            width={20} 
                                            height={20}
                                        />
                                        Download Word
                                    </button>
                                    <button 
                                        onClick={handleCopyText}
                                        className={cn(styles.actionButton, { [styles.success]: copySuccess })}
                                    >
                                        <Image 
                                            src={copySuccess ? "/icons/check.svg" : "/icons/copy.svg"}
                                            alt="Copy" 
                                            width={20} 
                                            height={20}
                                        />
                                        {copySuccess ? 'Copied!' : 'Copy Text'}
                                    </button>
                                </div>
                                <button 
                                    onClick={() => {
                                        setGeneratedContract(null);
                                        setInputText('');
                                    }}
                                    className={styles.newDraftButton}
                                >
                                    Create New Draft
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isGenerating && (
                        <motion.div 
                            className={styles.generatingOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className={styles.loadingIcon}>
                                <div className={styles.spinner}></div>
                                <Image 
                                    src="/icons/lawbit-preview.svg" 
                                    alt="LawBit Logo" 
                                    width={70} 
                                    height={70} 
                                    className={styles.logo}
                                />
                            </div>
                            <h2 className={styles.loadingText}>Generating Your Legal Draft</h2>
                            <p className={styles.loadingDescription}>{generationSteps[generationStep]}</p>
                            <div className={styles.progressBarContainer}>
                                <div 
                                    className={styles.progressBar} 
                                    style={{ width: `${generationProgress}%` }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GenerateLegalDraft; 