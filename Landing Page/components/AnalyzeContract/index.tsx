import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';
import { AnalysisResponse } from '@/services/analysisService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Image from 'next/image';

type AnalysisData = {
    documentName: string;
    dateTime: string;
    riskAssessment: 'Low Risk' | 'Medium Risk' | 'High Risk';
    keyStatistics: {
        highRiskItems: number;
        timeToReview: string;
        jurisdiction: string;
    };
    jurisdictionClause: {
        text: string;
        extractedText: string;
        riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    };
    suggestedAlternatives: string[];
};

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

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
            setFile(droppedFile);
            setError(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setError(null);
    };

    const convertAnalysisToDisplayFormat = (analysis: AnalysisResponse): AnalysisData => {
        return {
            documentName: analysis.documentInfo.title,
            dateTime: new Date(analysis.documentInfo.dateTime).toLocaleString(),
            riskAssessment: analysis.documentInfo.riskAssessment,
            keyStatistics: {
                highRiskItems: analysis.documentInfo.keyStatistics.highRiskItems,
                timeToReview: '5-10 minutes', // Estimated time
                jurisdiction: analysis.documentInfo.jurisdiction
            },
            jurisdictionClause: {
                text: analysis.jurisdictionClause.text,
                extractedText: analysis.extractedText,
                riskLevel: analysis.jurisdictionClause.riskLevel
            },
            suggestedAlternatives: analysis.suggestedAlternatives.map(alt => alt.text)
        };
    };

    const handleAnalyze = async () => {
        try {
            setIsAnalyzing(true);
            setError(null);

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
            const formattedData = convertAnalysisToDisplayFormat(analysisResponse);
            setAnalysisData(formattedData);
            setShowAnalysis(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
            setError(errorMessage);
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.uploadContainer}>
                    {activeTab === 'upload' ? (
                        <div
                            className={cn(styles.dropZone, {
                                [styles.dragging]: isDragging
                            })}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
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
                                <p>
                                    Drag and drop file or{' '}
                                    <label htmlFor="fileInput" className={styles.chooseFile}>
                                        Choose file
                                    </label>
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
                        <div className={styles.tabSelector}>
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
                            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze your document now    '}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {showAnalysis && (
                <div className={styles.analysisContent}>
                    <div className={styles.documentInfo}>
                        <div className={styles.documentContainer}>
                            <div className={styles.documentText}>
                                <p>{analysisData?.jurisdictionClause.text}</p>
                                <p>{analysisData?.jurisdictionClause.extractedText}</p>
                            </div>
                            <div className={styles.documentFooter}>
                                <span>{analysisData?.documentName}</span>
                                <button className={styles.deleteButton}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className={styles.analysisGrid}>
                            <div className={styles.analysisDetails}>
                                <div className={styles.infoItem}>
                                    <label>Date and Time</label>
                                    <p>{analysisData?.dateTime}</p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Risk assessment</label>
                                    <div className={styles.riskAssessment}>
                                        <div className={styles.riskBadge}>{analysisData?.riskAssessment}</div>
                                        <div className={styles.riskProgressBar}>
                                            <div 
                                                className={styles.riskProgress} 
                                                style={{ 
                                                    width: analysisData?.riskAssessment === 'Low Risk' ? '33%' : 
                                                           analysisData?.riskAssessment === 'Medium Risk' ? '66%' : '100%' 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Key Statistics</label>
                                    <div className={styles.statsList}>
                                        <div className={styles.statItem}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>{analysisData?.keyStatistics.highRiskItems} high risk items</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>{analysisData?.keyStatistics.timeToReview} to review</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>Jurisdiction: {analysisData?.keyStatistics.jurisdiction}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Jurisdiction Clause</h3>
                            <div className={cn(styles.clauseBox, styles[analysisData?.jurisdictionClause.riskLevel.toLowerCase().replace(' ', '') || ''])}>
                                <p>{analysisData?.jurisdictionClause.text}</p>
                            </div>
                            <div className={styles.extractedText}>
                                <h4>Extracted Text</h4>
                                <div className={styles.textBox}>
                                    <p>{analysisData?.jurisdictionClause.extractedText}</p>
                                    <button className={styles.copyTextButton}>
                                        <Image 
                                            src="/icons/copy.svg" 
                                            alt="Copy" 
                                            width={16} 
                                            height={16}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Suggested alternatives</h3>
                            <div className={styles.alternativesList}>
                                {analysisData?.suggestedAlternatives.map((alternative, index) => (
                                    <div key={index} className={styles.alternativeItem}>
                                        <span>{index + 1}</span>
                                        <p>{alternative}</p>
                                        <button className={styles.copyAltButton}>
                                            Copy
                                            <Image 
                                                src="/icons/copy.svg" 
                                                alt="Copy" 
                                                width={16} 
                                                height={16}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className={styles.downloadButton}
                            onClick={async () => {
                                if (!analysisData) return;

                                try {
                                    // Create a new PDF document
                                    const pdfDoc = await PDFDocument.create();
                                    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
                                    const { width, height } = page.getSize();

                                    // Load the standard font
                                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                    // Set initial position
                                    let y = height - 50;
                                    const margin = 50;
                                    const lineHeight = 20;

                                    // Helper function to add text
                                    const addText = (text: string, x: number, fontSize: number, isBold: boolean = false) => {
                                        const currentFont = isBold ? boldFont : font;
                                        page.drawText(text, {
                                            x,
                                            y,
                                            size: fontSize,
                                            font: currentFont,
                                            color: rgb(0, 0, 0),
                                        });
                                        y -= lineHeight;
                                    };

                                    // Add title
                                    addText('Document Analysis Report', margin, 24, true);
                                    y -= lineHeight * 2;

                                    // Document Info
                                    addText('Document Information', margin, 18, true);
                                    addText(`Document Name: ${analysisData.documentName}`, margin + 20, 12);
                                    addText(`Date and Time: ${analysisData.dateTime}`, margin + 20, 12);
                                    addText(`Risk Assessment: ${analysisData.riskAssessment}`, margin + 20, 12);
                                    y -= lineHeight;

                                    // Key Statistics
                                    addText('Key Statistics', margin, 18, true);
                                    addText(`High Risk Items: ${analysisData.keyStatistics.highRiskItems}`, margin + 20, 12);
                                    addText(`Time to Review: ${analysisData.keyStatistics.timeToReview}`, margin + 20, 12);
                                    addText(`Jurisdiction: ${analysisData.keyStatistics.jurisdiction}`, margin + 20, 12);
                                    y -= lineHeight;

                                    // Jurisdiction Clause
                                    addText('Jurisdiction Clause', margin, 18, true);
                                    addText(`Risk Level: ${analysisData.jurisdictionClause.riskLevel}`, margin + 20, 12);
                                    addText('Clause Text:', margin + 20, 12);
                                    const clauseLines = analysisData.jurisdictionClause.text.split('\n');
                                    clauseLines.forEach(line => {
                                        addText(line, margin + 40, 12);
                                    });
                                    y -= lineHeight;

                                    // Extracted Text
                                    addText('Extracted Text', margin, 18, true);
                                    const extractedLines = analysisData.jurisdictionClause.extractedText.split('\n');
                                    extractedLines.forEach(line => {
                                        addText(line, margin + 20, 12);
                                    });
                                    y -= lineHeight;

                                    // Suggested Alternatives
                                    addText('Suggested Alternatives', margin, 18, true);
                                    analysisData.suggestedAlternatives.forEach((alt, index) => {
                                        addText(`${index + 1}. ${alt}`, margin + 20, 12);
                                    });

                                    // Save the PDF
                                    const pdfBytes = await pdfDoc.save();
                                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                } catch (error) {
                                    console.error('Error generating PDF:', error);
                                    setError('Failed to generate PDF report');
                                }
                            }}
                        >
                            <span>Download Analysis</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3v10m0 0l-4-4m4 4l4-4m-10 7v4h12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyzeContract; 