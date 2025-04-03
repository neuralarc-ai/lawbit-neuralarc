import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';
import { AnalysisResponse, ClauseAnalysis, SuggestedAlternative } from '@/services/analysisService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast/Toaster';
import { useSupabase } from '@/components/Providers/SupabaseProvider';
import { useRouter } from 'next/navigation';

const AnalyzeContract = () => {
    const { showToast } = useToast();
    const { user, supabase } = useSupabase();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
    const [expandedAlternative, setExpandedAlternative] = useState<{ [key: string]: number | null }>({});

    // Add function to count risk levels in clauses
    const handleRiskCounts = (clauses: ClauseAnalysis[]) => {
        return clauses.reduce((counts, clause) => {
            if (clause.riskLevel === 'High Risk') counts.high++;
            else if (clause.riskLevel === 'Medium Risk') counts.medium++;
            else if (clause.riskLevel === 'Low Risk') counts.low++;
            return counts;
        }, { high: 0, medium: 0, low: 0 });
    };

    const clauseTitles = [
        "Termination Clause",
        "Limitation of liability",
        "Jurisdiction Clause"
    ];

    // Toggle expanded state for an alternative
    const toggleExpandAlternative = (clauseIndex: number, alternativeId: number) => {
        setExpandedAlternative(prev => {
            const key = `clause-${clauseIndex}`;
            return {
                ...prev,
                [key]: prev[key] === alternativeId ? null : alternativeId
            };
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setIsUploading(true);
            setFile(droppedFile);
            setError(null);
            setTimeout(() => {
                setIsUploading(false);
            }, 1000);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsUploading(true);
            setFile(selectedFile);
            setError(null);
            setTimeout(() => {
                setIsUploading(false);
            }, 1000);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!user) {
            showToast('Please sign in to analyze a contract');
            router.push('/auth/signin');
            return;
        }

        try {
            setIsAnalyzing(true);
            setError(null);

            // Check token usage before proceeding
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('token_usage')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
                throw new Error('Failed to check token usage');
            }

            console.log('Current token usage:', userData.token_usage);

            const tokenUsage = userData.token_usage || { total: 0, limit: 50000, remaining: 50000 };
            if (tokenUsage.remaining < 20000) {
                throw new Error('Insufficient tokens. Please upgrade your plan to continue.');
            }

            let response;
            if (activeTab === 'upload') {
                if (!file) {
                    throw new Error('Please select a file to analyze');
                }

                const formData = new FormData();
                formData.append('file', file);

                response = await fetch('/api/analyze/file', {
                    method: 'POST',
                    body: formData
                });
            } else {
                if (!text.trim()) {
                    throw new Error('Please enter some text to analyze');
                }

                response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: text })
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.details || 'Failed to analyze document');
            }

            const analysisResponse: AnalysisResponse = await response.json();

            // Validate response structure
            if (!analysisResponse.documentInfo) {
                throw new Error('Invalid analysis response: Missing document information');
            }

            if (!analysisResponse.clauses || !Array.isArray(analysisResponse.clauses) || analysisResponse.clauses.length === 0) {
                throw new Error('Invalid analysis response: No clauses identified');
            }

            // Update token usage after successful analysis
            console.log('Updating token usage for user:', user.id);
            try {
                const { data, error: updateError } = await supabase.rpc('update_token_usage', {
                    p_user_id: user.id,
                    p_action: 'analyze',
                    p_tokens: 20000
                });
                
                console.log('Token update response:', { data, error: updateError });
                
                if (updateError) {
                    console.error('Failed to update token usage:', updateError);
                    showToast('Contract analyzed but failed to update token usage. Please contact support.');
                } else {
                    showToast('Contract analyzed successfully!');
                }
            } catch (updateErr) {
                console.error('Exception during token update:', updateErr);
                showToast('Contract analyzed but failed to update token usage. Please contact support.');
            }

            // Ensure all required fields exist
            if (!analysisResponse.documentInfo.keyStatistics) {
                analysisResponse.documentInfo.keyStatistics = {
                    highRiskItems: handleRiskCounts(analysisResponse.clauses).high,
                    clausesIdentified: analysisResponse.clauses.length,
                    riskScore: calculateRiskScore(analysisResponse.clauses)
                };
            }

            // Set missing values with calculated ones if they don't exist
            if (!analysisResponse.documentInfo.keyStatistics.riskScore) {
                analysisResponse.documentInfo.keyStatistics.riskScore = calculateRiskScore(analysisResponse.clauses);
            }

            if (!analysisResponse.documentInfo.keyStatistics.highRiskItems) {
                analysisResponse.documentInfo.keyStatistics.highRiskItems = handleRiskCounts(analysisResponse.clauses).high;
            }

            if (!analysisResponse.documentInfo.keyStatistics.clausesIdentified) {
                analysisResponse.documentInfo.keyStatistics.clausesIdentified = analysisResponse.clauses.length;
            }

            // Set analysis data and show analysis view
            setAnalysisData(analysisResponse);
            setShowAnalysis(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
            setError(errorMessage);
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Calculate risk score based on clause risk levels
    const calculateRiskScore = (clauses: ClauseAnalysis[]): number => {
        if (!clauses.length) return 50; // Default value if no clauses

        const riskWeights = {
            'High Risk': 100,
            'Medium Risk': 60,
            'Low Risk': 20
        };

        let totalRiskScore = 0;
        clauses.forEach(clause => {
            totalRiskScore += riskWeights[clause.riskLevel] || 60;
        });

        // Calculate average and invert (higher risk = lower score)
        const averageRisk = Math.round(totalRiskScore / clauses.length);
        return Math.max(1, Math.min(100, averageRisk)); // Ensure between 1-100
    };

    // Get risk badge color class based on risk level
    const getRiskColorClass = (riskLevel: string) => {
        switch (riskLevel) {
            case 'High Risk':
                return styles.highRisk;
            case 'Medium Risk':
                return styles.mediumRisk;
            case 'Low Risk':
                return styles.lowRisk;
            default:
                return styles.mediumRisk;
        }
    };

    // Update the copyToClipboard function
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Text copied to clipboard');
    };

    // Handle download PDF report
    const handleDownloadPDF = async () => {
        if (!analysisData) return;

        try {
            const pdfDoc = await PDFDocument.create();
            
            // Embed Times New Roman font (or closest available)
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
            
            // Add a new page
            let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
            let { width, height } = page.getSize();
            
            // Set initial position
            let y = height - 50;
            const margin = 50;
            const lineHeight = 20;
            const maxWidth = width - (margin * 2); // Maximum width for text content
            
            // Helper function to wrap text
            const wrapText = (text: string, fontSize: number, maxWidth: number, font: any) => {
                const words = text.split(' ');
                const lines: string[] = [];
                let currentLine = words[0];

                for (let i = 1; i < words.length; i++) {
                    const width = font.widthOfTextAtSize(currentLine + ' ' + words[i], fontSize);
                    if (width < maxWidth) {
                        currentLine += ' ' + words[i];
                    } else {
                        lines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                lines.push(currentLine);
                return lines;
            };

            // Helper function to add text with wrapping
            const addText = (text: string, x: number, fontSize: number, isBold: boolean = false, color = rgb(0, 0, 0)) => {
                const currentFont = isBold ? boldFont : timesRomanFont;
                const lines = wrapText(text, fontSize, maxWidth - (x - margin), currentFont);
                
                lines.forEach(line => {
                    if (y < 100) {
                        page = pdfDoc.addPage([595.28, 841.89]);
                        y = height - 50;
                    }
                    
                    page.drawText(line, {
                    x,
                    y,
                    size: fontSize,
                    font: currentFont,
                    color,
                });
                y -= lineHeight;
                });
            };
            
            // Helper function to add section with proper spacing
            const addSection = (title: string, content: string, indent: number = 0) => {
                addText(title, margin + indent, 12, true);
            y -= lineHeight;
                addText(content, margin + indent + 20, 12);
                y -= lineHeight * 2;
            };

            // Document Info Section
            addText('Document Analysis Report', margin, 24, true);
            y -= lineHeight * 2;
            
            // Document Information
            addText('Document Information', margin, 18, true);
            y -= lineHeight;
            addSection('Document Name:', analysisData.documentInfo.title || "Untitled Document");
            addSection('Date and Time:', formatDate(new Date(analysisData.documentInfo.dateTime)));
            
            // Risk Assessment
            const riskColor = analysisData.documentInfo.riskAssessment === 'High Risk' 
                ? rgb(0.9, 0.2, 0.2) 
                : analysisData.documentInfo.riskAssessment === 'Medium Risk'
                    ? rgb(0.9, 0.5, 0.1)
                    : rgb(0.9, 0.8, 0.2);
            
            addText('Risk Assessment:', margin + 20, 12, true);
            y += lineHeight;
            
            addText(`Risk Assessment: `, margin + 20, 12);
            y += lineHeight; // Move back up to add color text on same line
            addText(analysisData.documentInfo.riskAssessment, margin + 140, 12, true, riskColor);
            
            y -= lineHeight;
            
            // Key Statistics
            addText('Key Statistics', margin, 18, true);
            y -= lineHeight;
            const riskCounts = handleRiskCounts(analysisData.clauses);
            addSection('High Risk Items:', riskCounts.high.toString());
            addSection('Medium Risk Items:', riskCounts.medium.toString());
            addSection('Low Risk Items:', riskCounts.low.toString());
            addSection('Total Clauses:', (analysisData.documentInfo.keyStatistics.clausesIdentified || analysisData.clauses.length).toString());
            if (analysisData.documentInfo.jurisdiction) {
                addSection('Jurisdiction:', analysisData.documentInfo.jurisdiction);
            addText(`Jurisdiction: ${analysisData.documentInfo.jurisdiction}`, margin + 20, 12);
            }
            addSection('Risk Score:', `${analysisData.documentInfo.keyStatistics.riskScore}/100`);
            y -= lineHeight * 2;

            addText(`Risk Score: `, margin + 20, 12);
            y += lineHeight; // Move back up to add color text on same line
            const riskScoreColor = analysisData.documentInfo.keyStatistics.riskScore > 70 
                ? rgb(0.9, 0.2, 0.2)  // High risk - red
                : analysisData.documentInfo.keyStatistics.riskScore > 40 
                    ? rgb(0.9, 0.5, 0.1)  // Medium risk - orange
                    : rgb(0.9, 0.8, 0.2);  // Low risk - yellow
            addText(analysisData.documentInfo.keyStatistics.riskScore.toString(), margin + 140, 12, true, riskScoreColor);

            y -= lineHeight;
            const previewText = analysisData.documentInfo.previewText || 
                (analysisData.clauses.length > 0 ? analysisData.clauses[0].extractedText : '');
            addText(previewText, margin + 20, 12);
            y -= lineHeight * 2;

            // Clauses Analysis
            addText('Clauses Analysis', margin, 18, true);
            y -= lineHeight;

            // Sort clauses by risk level
            const sortedClauses = [...analysisData.clauses].sort((a, b) => {
                const riskOrder = { 'High Risk': 0, 'Medium Risk': 1, 'Low Risk': 2 };
                return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
            });

            // Add each clause
            for (const clause of sortedClauses) {
                if (y < 100) {
                    page = pdfDoc.addPage([595.28, 841.89]);
                    y = height - 50;
                }
                
                // Clause header
                addText(clause.title || 'Untitled Clause', margin, 16, true);
                addText(`Risk Level: ${clause.riskLevel}`, margin + 20, 12);
                y -= lineHeight * 2;

                // Original text
                if (clause.text) {
                    addText('Original Text:', margin + 20, 12, true);
                    addText(clause.text, margin + 40, 12);
                    y -= lineHeight * 2;
                }

                // Extracted text
                addText('Extracted Text:', margin + 20, 12, true);
                addText(clause.extractedText, margin + 40, 12);
                y -= lineHeight * 2;

                // Suggested alternatives
                if (clause.suggestedAlternatives && clause.suggestedAlternatives.length > 0) {
                    addText('Suggested Alternatives:', margin + 20, 12, true);
                    y -= lineHeight;
                    
                    for (const alt of clause.suggestedAlternatives) {
                        if (y < 100) {
                            page = pdfDoc.addPage([595.28, 841.89]);
                            y = height - 50;
                        }
                        
                        addText(`Alternative ${alt.id}:`, margin + 40, 12, true);
                        addText(alt.text, margin + 60, 12);
                        if (alt.description) {
                            addText('Description:', margin + 60, 12, true);
                            addText(alt.description, margin + 80, 12);
                        }
                        y -= lineHeight * 2;
                    }
                }
                y -= lineHeight * 2;
            }
            
            // Add page numbers
            for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const p = pdfDoc.getPage(i);
                const { width, height } = p.getSize();
                p.drawText(`Page ${i + 1} of ${pdfDoc.getPageCount()}`, {
                    x: width - 150,
                    y: 30,
                    size: 10,
                    font: timesRomanFont,
                });
            }
            
            // Save the PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analysis_${analysisData.documentInfo.title || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Failed to generate PDF report');
        }
    };

    // Function to reset analysis state
    const handleReset = () => {
        // Add a slight delay before resetting state to allow for animation
        setTimeout(() => {
            setShowAnalysis(false);
            setFile(null);
            setText('');
            setError(null);
            // Optionally reset other states if needed
            // setAnalysisData(null);
        }, 300);
    };

    const formatDate = (date: Date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const localDate = new Date(date.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
        const month = months[localDate.getMonth()];
        const day = localDate.getDate();
        const year = localDate.getFullYear();
        const hours = localDate.getHours().toString().padStart(2, '0');
        const minutes = localDate.getMinutes().toString().padStart(2, '0');
        return `${month} ${day}, ${year} at ${hours}:${minutes}`;
    };

    return (
        <div className={styles.container}>
            <AnimatePresence mode="wait">
                {!showAnalysis ? (
                    <motion.div
                        className={styles.mainContent}
                        key="upload-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                <div className={styles.uploadContainer}>
                    {activeTab === 'upload' ? (
                        <div
                            className={cn(styles.dropZone, {
                                [styles.dragging]: isDragging,
                                [styles.uploading]: isUploading,
                                [styles.uploaded]: file && !isUploading
                            })}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className={styles.fileInput}
                                accept=".txt,.doc,.docx,.pdf"
                                id="fileInput"
                            />
                            <Image 
                                src="/icons/upload.svg" 
                                alt="Upload" 
                                width={70} 
                                height={70}
                                className={styles.uploadIcon}
                            />
                            <div className={styles.uploadText}>
                                <p className={styles.uploadTextContent}>
                                    {isAnalyzing ? (
                                        <span className={styles.analyzingText}>Analyzing...</span>
                                    ) : isUploading ? (
                                        'Uploading...'
                                    ) : file ? (
                                        <div className={styles.uploadTextContent}>
                                            File uploaded: {file.name}
                                            <button
                                                type="button"
                                                className={styles.removeFileButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            Drag and drop file or{' '}
                                            <label 
                                                htmlFor="fileInput" 
                                                className={styles.chooseFile}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Choose file
                                            </label>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.pasteZone}>
                            <textarea
                                placeholder="Paste your text here..."
                                value={text}
                                onChange={handleTextChange}
                            />
                        </div>
                    )}
                    
                    <div className={styles.actionsRow}>
                        <div 
                            className={styles.tabSelector}
                            data-state={activeTab}
                        >
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: activeTab === 'upload'
                                })}
                                onClick={() => {
                                    setActiveTab('upload');
                                    setError(null);
                                }}
                            >
                                Upload File
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: activeTab === 'paste'
                                })}
                                onClick={() => {
                                    setActiveTab('paste');
                                    setError(null);
                                }}
                            >
                                Paste Text
                            </button>
                        </div>

                        <button 
                            type="button" 
                            className={cn(styles.analyzeButton, {
                                [styles.analyzing]: isAnalyzing
                            })} 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                        >
                            <span>Analyze Your Draft Now     </span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className={styles.analysisContent}
                        key="analysis-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                    {analysisData && (
                        <div className={styles.documentInfo}>
                                <div className={styles.headerRow}>
                                    <h3 className={styles.documentTitle}>Document Information</h3>
                                    <button
                                        className={styles.backButton}
                                        onClick={handleReset}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Back
                                    </button>
                                </div>

                            <div className={styles.infoHeader}>
                                <div className={styles.previewSection}>
                                        <h3 className={styles.sectionHeading}>Document Preview</h3>
                                    <div className={styles.documentPreview}>
                                        <p className={styles.previewText}>
                                            {analysisData.documentInfo.title || (file ? file.name : "Untitled Document")}
                                                {analysisData.documentInfo.previewText ? (
                                                <>
                                                    <br /><br />
                                                    {analysisData.documentInfo.previewText}
                                                </>
                                                ) : (
                                                    analysisData.clauses.length > 0 && (
                                                        <>
                                                            <br /><br />
                                                            {analysisData.clauses[0].extractedText}
                                                        </>
                                                    )
                                            )}
                                        </p>
                                        <div className={styles.fileInfo}>
                                            <div className={styles.fileName}>
                                                {activeTab === 'upload' && file ? file.name : (analysisData.documentInfo.title || 'document.pdf')}
                                                <button 
                                                    className={styles.deleteButton}
                                                        onClick={handleReset}
                                                    >
                                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="44" height="44" rx="22" fill="#F8F8F8" fill-opacity="0.05" />
                                                            <g clip-path="url(#clip0_6112_88416)">
                                                                <path d="M16.5 16H16.61C17.0124 15.9897 17.4024 15.8582 17.7289 15.6227C18.0554 15.3872 18.3033 15.0586 18.44 14.68L18.474 14.577L18.571 14.286C18.654 14.037 18.696 13.913 18.751 13.807C18.8592 13.5994 19.0145 13.42 19.2045 13.2832C19.3944 13.1463 19.6138 13.0559 19.845 13.019C19.962 13 20.093 13 20.355 13H23.645C23.907 13 24.038 13 24.155 13.019C24.3862 13.0559 24.6056 13.1463 24.7955 13.2832C24.9855 13.42 25.1408 13.5994 25.249 13.807C25.304 13.913 25.346 14.037 25.429 14.286L25.526 14.577C25.6527 14.9983 25.9148 15.366 26.2717 15.6233C26.6285 15.8805 27.0603 16.0129 27.5 16" stroke="#989898" stroke-width="1.5" />
                                                                <path d="M30.5 16H13.5M28.833 18.5L28.373 25.4C28.196 28.054 28.108 29.381 27.243 30.19C26.378 30.999 25.048 31 22.387 31H21.613C18.953 31 17.623 31 16.757 30.19C15.892 29.381 15.804 28.054 15.627 25.4L15.167 18.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M19.5 21L20 26M24.5 21L24 26" stroke="#989898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_6112_88416">
                                                                    <rect width="24" height="24" fill="white" transform="translate(10 10)" />
                                                                </clipPath>
                                                            </defs>
                                                    </svg>

                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.infoDetails}>
                                    <div className={styles.infoItem}>
                                            <label className={styles.label}>Date and Time</label>
                                            <p className={styles.value}>{formatDate(new Date(analysisData.documentInfo.dateTime))}</p>
                                    </div>
                                    
                                        <div className={styles.infoItem}>
                                            <h4 className={styles.heading4}>Key statistics</h4>
                                            <div className={styles.keyStatsRow}>
                                                <div className={styles.keyStatItem}>
                                                    <div className={styles.keyStatIcon}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9.33854 1.33203H4.00521C3.65159 1.33203 3.31245 1.47251 3.0624 1.72256C2.81235 1.9726 2.67188 2.31174 2.67188 2.66536V13.332C2.67188 13.6857 2.81235 14.0248 3.0624 14.2748C3.31245 14.5249 3.65159 14.6654 4.00521 14.6654H12.0052C12.3588 14.6654 12.698 14.5249 12.948 14.2748C13.1981 14.0248 13.3385 13.6857 13.3385 13.332V5.33203L9.33854 1.33203Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M9.32812 1.33203V5.33203H13.3281" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M10.6615 8.66797H5.32812" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M10.6615 11.332H5.32812" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M6.66146 6H5.99479H5.32812" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>

                                                    </div>
                                                    <span>{analysisData.documentInfo.keyStatistics.clausesIdentified || analysisData.clauses.length} clauses identified</span>
                                                </div>

                                                {analysisData.documentInfo.jurisdiction && (
                                                    <div className={styles.keyStatItem}>
                                                        <div className={styles.keyStatIcon}>
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clip-path="url(#clip0_6118_116528)">
                                                                    <path d="M7.99479 14.6654C11.6767 14.6654 14.6615 11.6806 14.6615 7.9987C14.6615 4.3168 11.6767 1.33203 7.99479 1.33203C4.31289 1.33203 1.32812 4.3168 1.32812 7.9987C1.32812 11.6806 4.31289 14.6654 7.99479 14.6654Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M1.32812 8H14.6615" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M7.99479 1.33203C9.66231 3.1576 10.61 5.52672 10.6615 7.9987C10.61 10.4707 9.66231 12.8398 7.99479 14.6654C6.32727 12.8398 5.37962 10.4707 5.32812 7.9987C5.37962 5.52672 6.32727 3.1576 7.99479 1.33203Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_6118_116528">
                                                                        <rect width="16" height="16" fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>

                                                        </div>
                                                        <span>Jurisdiction: {analysisData.documentInfo.jurisdiction}</span>
                                        </div>
                                    )}
                                            </div>
                                        </div>
                                    
                                    <div className={styles.infoItem}>
                                        <div className={styles.riskAssessment}>
                                                <h4 className={styles.heading4}>Risk assessment</h4>
                                                <div className={styles.riskInfo}>
                                                    <div className={cn(
                                                        styles.riskName,
                                                        analysisData.documentInfo.keyStatistics.riskScore > 70 ? styles.highRiskText :
                                                            analysisData.documentInfo.keyStatistics.riskScore > 40 ? styles.mediumRiskText :
                                                                styles.lowRiskText
                                                    )}>
                                                        {analysisData.documentInfo.keyStatistics.riskScore > 70 
                                                            ? "High Risk" 
                                                            : analysisData.documentInfo.keyStatistics.riskScore > 40 
                                                                ? "Medium Risk" 
                                                                : "Low Risk"}
                                                    </div>
                                                    <div className={cn(
                                                        styles.riskScore,
                                                        analysisData.documentInfo.keyStatistics.riskScore > 70 ? styles.highRiskScore :
                                                            analysisData.documentInfo.keyStatistics.riskScore > 40 ? styles.mediumRiskScore :
                                                                styles.lowRiskScore
                                                    )}>
                                                    {analysisData.documentInfo.keyStatistics.riskScore}/100
                                                    </div>
                                                </div>
                                        </div>
                                        <div className={styles.riskProgressBar}>
                                            <div 
                                                        className={cn(
                                                            styles.riskProgress,
                                                            analysisData.documentInfo.keyStatistics.riskScore > 70 ? styles.highRisk :
                                                                analysisData.documentInfo.keyStatistics.riskScore > 40 ? styles.mediumRisk :
                                                                    styles.lowRisk
                                                        )}
                                                        style={{ width: `${analysisData.documentInfo.keyStatistics.riskScore}%` }}
                                                    />
                                        </div>
                                    </div>
                                    
                                        <div className={styles.statsList}>
                                            <div className={cn(styles.statItem, styles.highRiskStat)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).high} High risk item{handleRiskCounts(analysisData.clauses).high !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={cn(styles.statItem, styles.mediumRiskStat)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).medium} Medium risk item{handleRiskCounts(analysisData.clauses).medium !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={cn(styles.statItem, styles.lowRiskStat)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).low} Low risk item{handleRiskCounts(analysisData.clauses).low !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                </div>
                            </div>

                            {/* Clauses Analysis Sections */}
                                {/* Sort and group clauses by risk level: high first, then medium, then low */}
                                {/* High Risk Clauses */}
                                {analysisData.clauses
                                    .filter(clause => clause.riskLevel === 'High Risk')
                                    .map((clause, clauseIndex) => {
                                // Use predefined titles if available, otherwise use from clause
                                        const title = clause.title || clauseTitles[clauseIndex] || `Clause ${clauseIndex + 1}`;
                                
                                return (
                                    <div 
                                                key={`high-${clauseIndex}`}
                                        className={cn(
                                            styles.clauseSection,
                                                    styles.highRisk
                                        )}
                                    >
                                        <div className={styles.clauseHeader}>
                                                    <h3 className={styles.heading3}>{title}</h3>
                                            <div 
                                                className={cn(
                                                    styles.riskBadge, 
                                                            styles.highRisk
                                                )}
                                            >
                                                        High Risk
                                            </div>
                                        </div>
                                        
                                        {clause.text && <p className={styles.clauseText}>{clause.text}</p>}
                                        
                                        {/* Extracted Text */}
                                        <div className={styles.extractedText}>
                                                    <h4 className={styles.heading4}>Extracted Text</h4>
                                            <div className={styles.textBox}>
                                                        <p className={styles.textContent}>{clause.extractedText}</p>
                                            </div>
                                                </div>

                                                {/* Suggested Alternatives */}
                                                {clause.suggestedAlternatives && clause.suggestedAlternatives.length > 0 && (
                                                    <div className={styles.suggestedSection}>
                                                        <h4 className={styles.heading4}>Suggested alternatives</h4>
                                                        <div className={styles.alternativesList}>
                                                            {clause.suggestedAlternatives.slice(0, 2).map((alt) => (
                                                                <div key={alt.id} className={styles.alternativeItem}>
                                                                    <div
                                                                        className={styles.alternativeHeader}
                                                                        onClick={() => toggleExpandAlternative(clauseIndex, alt.id)}
                                                                    >
                                                                        <span className={styles.alternativeNumber}>{alt.id}</span>
                                                                        <p className={styles.alternativeText}>{alt.text}</p>
                                                                        <div className={styles.alternativeActions}>
                                                <button 
                                                    className={styles.copyButton}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    copyToClipboard(alt.text);
                                                                                }}
                                                                            >
                                                                                Copy
                                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <rect width="36" height="36" rx="18" fill="#F8F8F8" fill-opacity="0.05" />
                                                                                    <path d="M23.4411 16.6641H17.9026C17.2229 16.6641 16.6719 17.2151 16.6719 17.8948V23.4333C16.6719 24.113 17.2229 24.6641 17.9026 24.6641H23.4411C24.1208 24.6641 24.6719 24.113 24.6719 23.4333V17.8948C24.6719 17.2151 24.1208 16.6641 23.4411 16.6641Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                    <path d="M13.8462 20H13.2308C12.9043 20 12.5913 19.8703 12.3605 19.6395C12.1297 19.4087 12 19.0957 12 18.7692V13.2308C12 12.9043 12.1297 12.5913 12.3605 12.3605C12.5913 12.1297 12.9043 12 13.2308 12H18.7692C19.0957 12 19.4087 12.1297 19.6395 12.3605C19.8703 12.5913 20 12.9043 20 13.2308V13.8462" stroke="#989898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>

                                                </button>
                                                </div>
                                        </div>
                                                                    <div className={cn(
                                                                        styles.alternativeDescription,
                                                                        { [styles.expanded]: expandedAlternative[`clause-${clauseIndex}`] === alt.id }
                                                                    )}>
                                                                        <p className={styles.descriptionText}>
                                                                            {alt.description || "This alternative provides clearer language and better protects your interests. It uses more precise terms and addresses potential loopholes in the original clause."}
                                                                        </p>
                                    </div>
                                </div>
                                                            ))}
                            </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                {/* Medium Risk Clauses */}
                                {analysisData.clauses
                                    .filter(clause => clause.riskLevel === 'Medium Risk')
                                    .map((clause, clauseIndex) => {
                                // Use predefined titles if available, otherwise use from clause
                                        const title = clause.title || clauseTitles[clauseIndex] || `Clause ${clauseIndex + 1}`;
                                
                                return (
                                    <div 
                                                key={`medium-${clauseIndex}`}
                                        className={cn(
                                            styles.clauseSection,
                                                    styles.mediumRisk
                                        )}
                                    >
                                        <div className={styles.clauseHeader}>
                                                    <h3 className={styles.heading3}>{title}</h3>
                                            <div 
                                                className={cn(
                                                    styles.riskBadge, 
                                                            styles.mediumRisk
                                                )}
                                            >
                                                        Medium Risk
                                            </div>
                                        </div>
                                        
                                        {clause.text && <p className={styles.clauseText}>{clause.text}</p>}
                                        
                                        {/* Extracted Text */}
                                        <div className={styles.extractedText}>
                                                    <h4 className={styles.heading4}>Extracted Text</h4>
                                            <div className={styles.textBox}>
                                                        <p className={styles.textContent}>{clause.extractedText}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Suggested Alternatives */}
                                                {clause.suggestedAlternatives && clause.suggestedAlternatives.length > 0 && (
                                        <div className={styles.suggestedSection}>
                                                        <h4 className={styles.heading4}>Suggested alternatives</h4>
                                            <div className={styles.alternativesList}>
                                                            {clause.suggestedAlternatives.slice(0, 2).map((alt) => (
                                                    <div key={alt.id} className={styles.alternativeItem}>
                                                                    <div
                                                                        className={styles.alternativeHeader}
                                                                        onClick={() => toggleExpandAlternative(clauseIndex, alt.id)}
                                                                    >
                                                            <span className={styles.alternativeNumber}>{alt.id}</span>
                                                                        <p className={styles.alternativeText}>{alt.text}</p>
                                                            <div className={styles.alternativeActions}>
                                                                <button 
                                                                    className={styles.copyButton}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    copyToClipboard(alt.text);
                                                                                }}
                                                                >
                                                                    Copy
                                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <rect width="36" height="36" rx="18" fill="#F8F8F8" fill-opacity="0.05" />
                                                                                    <path d="M23.4411 16.6641H17.9026C17.2229 16.6641 16.6719 17.2151 16.6719 17.8948V23.4333C16.6719 24.113 17.2229 24.6641 17.9026 24.6641H23.4411C24.1208 24.6641 24.6719 24.113 24.6719 23.4333V17.8948C24.6719 17.2151 24.1208 16.6641 23.4411 16.6641Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                    <path d="M13.8462 20H13.2308C12.9043 20 12.5913 19.8703 12.3605 19.6395C12.1297 19.4087 12 19.0957 12 18.7692V13.2308C12 12.9043 12.1297 12.5913 12.3605 12.3605C12.5913 12.1297 12.9043 12 13.2308 12H18.7692C19.0957 12 19.4087 12.1297 19.6395 12.3605C19.8703 12.5913 20 12.9043 20 13.2308V13.8462" stroke="#989898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    </svg>

                                                                </button>
                                                            </div>
                                                        </div>
                                                                    <div className={cn(
                                                                        styles.alternativeDescription,
                                                                        { [styles.expanded]: expandedAlternative[`clause-${clauseIndex}`] === alt.id }
                                                                    )}>
                                                                        <p className={styles.descriptionText}>
                                                                            {alt.description || "This alternative provides clearer language and better protects your interests. It uses more precise terms and addresses potential loopholes in the original clause."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                {/* Low Risk Clauses */}
                                {analysisData.clauses
                                    .filter(clause => clause.riskLevel === 'Low Risk')
                                    .map((clause, clauseIndex) => {
                                        // Use predefined titles if available, otherwise use from clause
                                        const title = clause.title || clauseTitles[clauseIndex] || `Clause ${clauseIndex + 1}`;

                                        return (
                                            <div
                                                key={`low-${clauseIndex}`}
                                                className={cn(
                                                    styles.clauseSection,
                                                    styles.lowRisk
                                                )}
                                            >
                                                <div className={styles.clauseHeader}>
                                                    <h3 className={styles.heading3}>{title}</h3>
                                                    <div
                                                        className={cn(
                                                            styles.riskBadge,
                                                            styles.lowRisk
                                                        )}
                                                    >
                                                        Low Risk
                                                    </div>
                                                </div>

                                                {clause.text && <p className={styles.clauseText}>{clause.text}</p>}

                                                {/* Extracted Text */}
                                                <div className={styles.extractedText}>
                                                    <h4 className={styles.heading4}>Extracted Text</h4>
                                                    <div className={styles.textBox}>
                                                        <p className={styles.textContent}>{clause.extractedText}</p>
                                                    </div>
                                                </div>

                                                {/* Suggested Alternatives */}
                                                {clause.suggestedAlternatives && clause.suggestedAlternatives.length > 0 && (
                                                    <div className={styles.suggestedSection}>
                                                        <h4 className={styles.heading4}>Suggested alternatives</h4>
                                                        <div className={styles.alternativesList}>
                                                            {clause.suggestedAlternatives.slice(0, 2).map((alt) => (
                                                                <div key={alt.id} className={styles.alternativeItem}>
                                                                    <div
                                                                        className={styles.alternativeHeader}
                                                                onClick={() => toggleExpandAlternative(clauseIndex, alt.id)}
                                                            >
                                                                        <span className={styles.alternativeNumber}>{alt.id}</span>
                                                                        <p className={styles.alternativeText}>{alt.text}</p>
                                                                        <div className={styles.alternativeActions}>
                                                                            <button
                                                                                className={styles.copyButton}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    copyToClipboard(alt.text);
                                                                                }}
                                                                            >
                                                                                Copy
                                                                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <rect width="36" height="36" rx="18" fill="#F8F8F8" fill-opacity="0.05" />
                                                                                    <path d="M23.4411 16.6641H17.9026C17.2229 16.6641 16.6719 17.2151 16.6719 17.8948V23.4333C16.6719 24.113 17.2229 24.6641 17.9026 24.6641H23.4411C24.1208 24.6641 24.6719 24.113 24.6719 23.4333V17.8948C24.6719 17.2151 24.1208 16.6641 23.4411 16.6641Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                    <path d="M13.8462 20H13.2308C12.9043 20 12.5913 19.8703 12.3605 19.6395C12.1297 19.4087 12 19.0957 12 18.7692V13.2308C12 12.9043 12.1297 12.5913 12.3605 12.3605C12.5913 12.1297 12.9043 12 13.2308 12H18.7692C19.0957 12 19.4087 12.1297 19.6395 12.3605C19.8703 12.5913 20 12.9043 20 13.2308V13.8462" stroke="#989898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>

                                                                            </button>
                                                            </div>
                                                                    </div>
                                                                    <div className={cn(
                                                                        styles.alternativeDescription,
                                                                        { [styles.expanded]: expandedAlternative[`clause-${clauseIndex}`] === alt.id }
                                                                    )}>
                                                                        <p className={styles.descriptionText}>
                                                                            {alt.description || "This alternative provides clearer language and better protects your interests. It uses more precise terms and addresses potential loopholes in the original clause."}
                                                                        </p>
                                                                    </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                                )}
                                    </div>
                                );
                            })}

                            {/* Download Button */}
                            <button 
                                type="button" 
                                className={styles.downloadButton}
                                onClick={handleDownloadPDF}
                            >
                                <span>Download Analysis</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4v13m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    )}
                    </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default AnalyzeContract; 