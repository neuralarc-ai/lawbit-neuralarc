import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

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
                        
                        <button type="button" className={styles.analyzeButton}>
                            Analyze your document now
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default AnalyzeContract; 