import { useState } from 'react';
import cn from 'classnames';
import styles from './AnalyzeContract.module.sass';

const AnalyzeContract = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadSection}>
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
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                    />
                    <div className={styles.uploadIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3>Drop your document here</h3>
                    <p>or click to browse</p>
                </div>
            </div>
            <div className={styles.previewSection}>
                {file ? (
                    <div className={styles.filePreview}>
                        <h3>{file.name}</h3>
                        <p>{Math.round(file.size / 1024)} KB</p>
                    </div>
                ) : (
                    <div className={styles.previewPlaceholder}>
                        <img src="/images/logo-gray.svg" alt="Preview" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzeContract; 