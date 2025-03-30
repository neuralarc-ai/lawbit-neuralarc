import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';

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

const mockAnalysis: AnalysisData = {
    documentName: 'legal_agreement.pdf',
    dateTime: 'March 30, 2025 at 18:30',
    riskAssessment: 'Medium Risk',
    keyStatistics: {
        highRiskItems: 4,
        timeToReview: '10 minutes',
        jurisdiction: 'United States'
    },
    jurisdictionClause: {
        text: 'Sem morbi imperdiet tortor nisi augue vivamus quam fugiat. Pames nisi sodales ut ullamcorper.',
        extractedText: 'Faucibus ut accumsan finibus leo accumsan nodo nullam amet sapien. Diam porttitor auctor mattis evm. Est diam ut et pellentesque quis et est cras. Aliquiet nec sodales non convallis. Mattis nunc finibus nulla hendrerit nec sodales ut mauris.',
        riskLevel: 'Medium Risk'
    },
    suggestedAlternatives: [
        'Ligula pharetra tristique mattis sagittis',
        'Ligula pharetra tristique mattis sagittis',
        'Ligula pharetra tristique mattis sagittis',
        'Ligula pharetra tristique mattis sagittis'
    ]
};

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [showAnalysis, setShowAnalysis] = useState(false);

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
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleAnalyze = () => {
        setShowAnalysis(true);
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
                                    onClick={() => setActiveTab('upload')}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    className={cn(styles.tabButton, {
                                        [styles.active]: activeTab === 'paste'
                                    })}
                                    onClick={() => setActiveTab('paste')}
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
                                    />
                                    <div className={styles.uploadIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <div className={styles.uploadText}>
                                        <p className={styles.mainText}>Drag and drop file or Choose file</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.pasteZone}>
                                    <textarea
                                        placeholder="Paste your text here..."
                                        className={styles.pasteInput}
                                    />
                                </div>
                            )}
                            
                            <button type="button" className={styles.analyzeButton} onClick={handleAnalyze}>
                                <span>Analyze your document now</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.analysisContent}>
                        <div className={styles.documentInfo}>
                            <div className={styles.documentContainer}>
                                <div className={styles.documentText}>
                                    <p>{mockAnalysis.jurisdictionClause.text}</p>
                                    <p>{mockAnalysis.jurisdictionClause.text}</p>
                                </div>
                                <div className={styles.documentFooter}>
                                    <span>{mockAnalysis.documentName}</span>
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
                                        <p>{mockAnalysis.dateTime}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Risk assessment</label>
                                        <div className={styles.riskAssessment}>
                                            <div className={styles.riskBadge}>{mockAnalysis.riskAssessment}</div>
                                            <div className={styles.riskProgressBar}>
                                                <div 
                                                    className={styles.riskProgress} 
                                                    style={{ 
                                                        width: mockAnalysis.riskAssessment === 'Low Risk' ? '33%' : 
                                                               mockAnalysis.riskAssessment === 'Medium Risk' ? '66%' : '100%' 
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
                                                <span>{mockAnalysis.keyStatistics.highRiskItems} high risk items</span>
                                            </div>
                                            <div className={styles.statItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>{mockAnalysis.keyStatistics.timeToReview} identified</span>
                                            </div>
                                            <div className={styles.statItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>Jurisdiction: {mockAnalysis.keyStatistics.jurisdiction}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Jurisdiction Clause</h3>
                                <div className={cn(styles.clauseBox, styles[mockAnalysis.jurisdictionClause.riskLevel.toLowerCase().replace(' ', '')])}>
                                    <p>{mockAnalysis.jurisdictionClause.text}</p>
                                </div>
                                <div className={styles.extractedText}>
                                    <h4>Extracted Text</h4>
                                    <div className={styles.textBox}>
                                        <p>{mockAnalysis.jurisdictionClause.extractedText}</p>
                                        <button className={styles.copyTextButton}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 5v14h12V5H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Suggested alternatives</h3>
                                <div className={styles.alternativesList}>
                                    {mockAnalysis.suggestedAlternatives.map((alternative, index) => (
                                        <div key={index} className={styles.alternativeItem}>
                                            <span>{index + 1}</span>
                                            <p>{alternative}</p>
                                            <button className={styles.copyAltButton}>
                                                Copy
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M8 5v14h12V5H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="button" className={styles.downloadButton}>
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