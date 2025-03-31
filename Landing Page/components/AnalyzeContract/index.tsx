import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';
import { AnalysisResponse, ClauseAnalysis, SuggestedAlternative } from '@/services/analysisService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
    const [expandedAlternative, setExpandedAlternative] = useState<{[key: string]: number | null}>({});

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

    // Copy text to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    // Handle download PDF report
    const handleDownloadPDF = async () => {
        if (!analysisData) return;

        try {
            // Create a new PDF document
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
            
            // Helper function to add text
            const addText = (text: string, x: number, fontSize: number, isBold: boolean = false, color = rgb(0, 0, 0)) => {
                const currentFont = isBold ? boldFont : timesRomanFont;
                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: currentFont,
                    color,
                });
                y -= lineHeight;
            };
            
            // Add title
            addText('Document Analysis Report', margin, 24, true);
            y -= lineHeight;
            
            // Document Info
            addText('Document Information', margin, 18, true);
            addText(`Document Name: ${analysisData.documentInfo.title}`, margin + 20, 12);
            addText(`Date and Time: ${new Date(analysisData.documentInfo.dateTime).toLocaleString()}`, margin + 20, 12);
            
            // Risk Assessment
            const riskColor = analysisData.documentInfo.riskAssessment === 'High Risk' 
                ? rgb(0.9, 0.2, 0.2) 
                : analysisData.documentInfo.riskAssessment === 'Medium Risk'
                    ? rgb(0.9, 0.5, 0.1)
                    : rgb(0.9, 0.8, 0.2);
            
            addText(`Risk Assessment: `, margin + 20, 12);
            y += lineHeight; // Move back up to add color text on same line
            addText(analysisData.documentInfo.riskAssessment, margin + 140, 12, true, riskColor);
            
            y -= lineHeight;
            
            // Key Statistics
            addText('Key Statistics', margin, 18, true);
            addText(`High Risk Items: ${analysisData.documentInfo.keyStatistics.highRiskItems}`, margin + 20, 12);
            addText(`Clauses Identified: ${analysisData.documentInfo.keyStatistics.clausesIdentified || analysisData.clauses.length}`, margin + 20, 12);
            addText(`Jurisdiction: ${analysisData.documentInfo.jurisdiction}`, margin + 20, 12);
            y -= lineHeight;
            
            // Add content for risk scores and other stats
            // Add risk items count
            addText(`Risk Score: ${analysisData.documentInfo.keyStatistics.riskScore || 57}/100`, margin + 20, 12);
            addText(`High Risk Items: ${handleRiskCounts(analysisData.clauses).high}`, margin + 20, 12);
            addText(`Medium Risk Items: ${handleRiskCounts(analysisData.clauses).medium}`, margin + 20, 12);
            addText(`Low Risk Items: ${handleRiskCounts(analysisData.clauses).low}`, margin + 20, 12);
            y -= lineHeight;
            
            // Clauses
            for (let i = 0; i < analysisData.clauses.length; i++) {
                const clause = analysisData.clauses[i];
                
                // Add new page if needed
                if (y < 300) {
                    page.drawText(`- ${i+1} -`, {
                        x: width / 2 - 15,
                        y: 30,
                        size: 10,
                        font: timesRomanFont,
                    });
                    
                    page = pdfDoc.addPage([595.28, 841.89]);
                    const pageSize = page.getSize();
                    width = pageSize.width;
                    height = pageSize.height;
                    y = height - 50;
                }
                
                // Determine color for risk level
                const clauseRiskColor = clause.riskLevel === 'High Risk' 
                    ? rgb(0.9, 0.2, 0.2) 
                    : clause.riskLevel === 'Medium Risk'
                        ? rgb(0.9, 0.5, 0.1)
                        : rgb(0.9, 0.8, 0.2);
                
                // Add clause title and risk level
                addText(clauseTitles[i] || clause.title, margin, 18, true);
                addText(`Risk Level: `, margin + 20, 12);
                y += lineHeight; // Move back up for same line
                addText(clause.riskLevel, margin + 100, 12, true, clauseRiskColor);
                y -= lineHeight;
                
                // Add extracted text
                addText('Extracted Text:', margin + 20, 12, true);
                const extractedTextLines = clause.extractedText.split('\n');
                extractedTextLines.forEach(line => {
                    if (line.trim()) {
                        addText(line.trim(), margin + 30, 12);
                    }
                });
                y -= lineHeight;
                
                // Add suggested alternatives
                addText('Suggested Alternatives:', margin + 20, 12, true);
                clause.suggestedAlternatives.forEach((alt, index) => {
                    addText(`${index+1}. ${alt.text}`, margin + 30, 12);
                    
                    // Add description if available
                    if (alt.description) {
                        const descLines = alt.description.split('\n');
                        descLines.forEach(line => {
                            if (line.trim()) {
                                addText(line.trim(), margin + 40, 10, false, rgb(0.4, 0.4, 0.4));
                            }
                        });
                    }
                    y -= lineHeight / 2;
                });
                
                y -= lineHeight * 1.5;
            }
            
            // Add page numbers
            for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const p = pdfDoc.getPage(i);
                const { width, height } = p.getSize();
                p.drawText(`Page ${i+1} of ${pdfDoc.getPageCount()}`, {
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
            link.download = `analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Failed to generate PDF report');
        }
    };

    // Add function to count risk levels in clauses
    const handleRiskCounts = (clauses: ClauseAnalysis[]) => {
        return clauses.reduce((counts, clause) => {
            if (clause.riskLevel === 'High Risk') counts.high++;
            else if (clause.riskLevel === 'Medium Risk') counts.medium++;
            else if (clause.riskLevel === 'Low Risk') counts.low++;
            return counts;
        }, { high: 0, medium: 0, low: 0 });
    };

    return (
        <div className={styles.container}>
            {!showAnalysis ? (
                <div className={styles.mainContent}>
                    <div className={styles.uploadContainer}>
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
                                />
                                <div className={styles.uploadIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <div className={styles.uploadText}>
                                    <p className={styles.mainText}>
                                        {file ? file.name : 'Drag and drop file or Choose file'}
                                    </p>
                                    <p className={styles.subText}>
                                        Supported formats: .txt, .doc, .docx, .pdf (Max 10MB)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.pasteZone}>
                                <textarea
                                    placeholder="Paste your text here..."
                                    className={styles.pasteInput}
                                    value={text}
                                    onChange={handleTextChange}
                                />
                            </div>
                        )}
                        
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <button 
                            type="button" 
                            className={cn(styles.analyzeButton, {
                                [styles.analyzing]: isAnalyzing
                            })} 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                        >
                            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze your document now'}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.analysisContent}>
                    {analysisData && (
                        <div className={styles.documentInfo}>
                            <h3>Document Information</h3>
                            <div className={styles.infoHeader}>
                                <div className={styles.previewSection}>
                                    <div className={styles.documentPreview}>
                                        <p className={styles.previewText}>
                                            {analysisData.documentInfo.title || (file ? file.name : "Untitled Document")}
                                            {analysisData.documentInfo.previewText && (
                                                <>
                                                    <br /><br />
                                                    {analysisData.documentInfo.previewText}
                                                </>
                                            )}
                                        </p>
                                        <div className={styles.fileInfo}>
                                            <div className={styles.fileName}>
                                                {activeTab === 'upload' && file ? file.name : (analysisData.documentInfo.title || 'document.pdf')}
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={() => { /* Just for UI, no functionality needed */ }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.infoDetails}>
                                    <div className={styles.infoItem}>
                                        <label>Date and Time</label>
                                        <p>{new Date(analysisData.documentInfo.dateTime).toLocaleString()}</p>
                                    </div>
                                    
                                    {analysisData.documentInfo.jurisdiction && (
                                        <div className={styles.infoItem}>
                                            <label>Jurisdiction</label>
                                            <p>{analysisData.documentInfo.jurisdiction}</p>
                                        </div>
                                    )}
                                    
                                    <div className={styles.infoItem}>
                                        <label>Risk assessment</label>
                                        <div className={styles.riskAssessment}>
                                            <div 
                                                className={cn(
                                                    styles.riskBadge, 
                                                    getRiskColorClass(analysisData.documentInfo.riskAssessment)
                                                )}
                                            >
                                                {analysisData.documentInfo.riskAssessment}
                                            </div>
                                            <div className={styles.riskScore}>{analysisData.documentInfo.keyStatistics.riskScore || 57}/100</div>
                                        </div>
                                        <div className={styles.riskProgressBar}>
                                            <div 
                                                className={styles.riskProgress} 
                                                style={{ 
                                                    width: `${analysisData.documentInfo.keyStatistics.riskScore || 57}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={styles.infoItem}>
                                        <label>Key statistics</label>
                                        <div className={styles.statsList}>
                                            <div className={cn(styles.statItem, styles.highRiskItem)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).high || 0} High risk item{handleRiskCounts(analysisData.clauses).high !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={cn(styles.statItem, styles.mediumRiskItem)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).medium || 0} Medium risk item{handleRiskCounts(analysisData.clauses).medium !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={cn(styles.statItem, styles.lowRiskItem)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>{handleRiskCounts(analysisData.clauses).low || 0} Low risk item{handleRiskCounts(analysisData.clauses).low !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        <div className={styles.additionalStats}>
                                            <div className={styles.statItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>{analysisData.documentInfo.keyStatistics.clausesIdentified || analysisData.clauses.length} Clauses identified</span>
                                            </div>
                                            {analysisData.documentInfo.jurisdiction && (
                                                <div className={styles.statItem}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span>Jurisdiction: {analysisData.documentInfo.jurisdiction}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clauses Analysis Sections */}
                            {analysisData.clauses.map((clause, clauseIndex) => {
                                // Use predefined titles if available, otherwise use from clause
                                const title = clauseTitles[clauseIndex] || clause.title;
                                
                                return (
                                    <div 
                                        key={clauseIndex} 
                                        className={cn(
                                            styles.clauseSection,
                                            getRiskColorClass(clause.riskLevel)
                                        )}
                                    >
                                        <div className={styles.clauseHeader}>
                                            <h3>{title}</h3>
                                            <div 
                                                className={cn(
                                                    styles.riskBadge, 
                                                    getRiskColorClass(clause.riskLevel)
                                                )}
                                            >
                                                {clause.riskLevel}
                                            </div>
                                        </div>
                                        
                                        {clause.text && <p className={styles.clauseText}>{clause.text}</p>}
                                        
                                        {/* Extracted Text */}
                                        <div className={styles.extractedText}>
                                            <h4>Extracted Text</h4>
                                            <div className={styles.textBox}>
                                                <p>{clause.extractedText}</p>
                                                <button 
                                                    className={styles.copyButton}
                                                    onClick={() => copyToClipboard(clause.extractedText)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 5v14h12V5H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Suggested Alternatives */}
                                        <div className={styles.suggestedSection}>
                                            <h4>Suggested alternatives</h4>
                                            <div className={styles.alternativesList}>
                                                {clause.suggestedAlternatives.map((alt) => (
                                                    <div key={alt.id} className={styles.alternativeItem}>
                                                        <div className={styles.alternativeHeader}>
                                                            <span className={styles.alternativeNumber}>{alt.id}</span>
                                                            <p>{alt.text}</p>
                                                            <div className={styles.alternativeActions}>
                                                                <button 
                                                                    className={styles.copyButton}
                                                                    onClick={() => copyToClipboard(alt.text)}
                                                                >
                                                                    Copy
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 5v14h12V5H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {alt.description && (
                                                            <div 
                                                                className={cn(styles.alternativeDescription, {
                                                                    [styles.expanded]: expandedAlternative[`clause-${clauseIndex}`] === alt.id
                                                                })}
                                                                onClick={() => toggleExpandAlternative(clauseIndex, alt.id)}
                                                            >
                                                                <p>{alt.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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
                                    <path d="M12 3v10m0 0l-4-4m4 4l4-4m-10 7v4h12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalyzeContract; 