import React from 'react';
import styles from './ContractPreview.module.sass';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, Spacing, BorderStyle } from 'docx';
import { useToast } from '../Toast/Toaster';


interface ContractPreviewProps {
    content: string;
    onClose: () => void;
    isLoading?: boolean;
    error?: string | null;
}

interface FormattedContentItem {
    type: 'heading1' | 'heading2' | 'listItem' | 'keyValue' | 'paragraph';
    text?: string;
    key?: string;
    value?: string;
}

const ContractPreview = ({ content, onClose, isLoading, error }: ContractPreviewProps) => {
    const { showToast } = useToast();

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
            // Check for numbered list items (e.g., "1. ", "2. ", etc.)
            else if (/^\d+\.\s/.test(trimmedParagraph)) {
                return { type: 'listItem', text: trimmedParagraph.replace(/^\d+\.\s/, '') };
            }
            // Check for section headers (all caps)
            else if (/^[A-Z\s]+$/.test(trimmedParagraph) && trimmedParagraph.length > 3) {
                return { type: 'heading1', text: trimmedParagraph };
            }
            // Regular paragraph
            else {
                return { type: 'paragraph', text: trimmedParagraph };
            }
        });
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        
        // Set margins
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);
        
        // Add title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Generated Contract', pageWidth / 2, margin, { align: 'center' });
        
        // Process content for formatting
        const formattedContent = processContent(content);
        
        // Calculate starting Y position after title
        let yPosition = margin + 15;
        
        // Add each paragraph with proper formatting
        formattedContent.forEach(item => {
            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            switch (item.type) {
                case 'heading1':
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(item.text || '', margin, yPosition);
                    yPosition += 10;
                    break;
                    
                case 'heading2':
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(item.text || '', margin, yPosition);
                    yPosition += 8;
                    break;
                    
                case 'listItem':
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text('• ' + (item.text || ''), margin + 5, yPosition);
                    yPosition += 7;
                    break;
                    
                case 'keyValue':
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text((item.key || '') + ':', margin, yPosition);
                    doc.setFont('helvetica', 'normal');
                    doc.text(item.value || '', margin + 40, yPosition);
                    yPosition += 7;
                    break;
                    
                case 'paragraph':
                default:
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
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
        
        doc.save('generated-contract.pdf');
        showToast('Contract downloaded as PDF');
    };


    const handleDownloadDOCX = async () => {
        // Process content for formatting
        const formattedContent = processContent(content);
        
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
                        text: "Generated Contract",
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
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.text || '',
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
                                
                            case 'keyValue':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (item.key || '') + ": ",
                                            bold: true,
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.value || '',
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
        saveAs(blob, 'generated-contract.docx');
        showToast('Contract downloaded as DOCX');
    };


    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        showToast('Text copied to clipboard');
    };


    return (
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
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
                                        Loading...
                                    </motion.div>
                                </motion.div>
                            ) : error ? (
                                <div className={styles.error}>
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div className={styles.contractPreview}>
                                    <div className={styles.contractContent}>
                                        {processContent(content).map((item, index) => {
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
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className={styles.actionsSection}>
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
                                <button type="button" className={styles.iconButton} onClick={copyToClipboard}>
                                    <Image src="/icons/copy.svg" alt="Copy" width={24} height={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default ContractPreview; 