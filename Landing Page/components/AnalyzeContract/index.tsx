import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';
import { AnalysisResponse } from '@/services/analysisService';

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            setAnalysis(null);

            if (activeTab === 'upload') {
                if (!file) {
                    throw new Error('Please select a file to analyze');
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/analyze/file', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to analyze file');
                }

                const result = await response.json();
                setAnalysis(result);
            } else if (activeTab === 'paste') {
                if (!text.trim()) {
                    throw new Error('Please enter some text to analyze');
                }

                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: text })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to analyze text');
                }

                const result = await response.json();
                setAnalysis(result);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during analysis');
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
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
                                    Supported formats: .txt, .doc, .docx, .pdf
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

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyzeContract; 