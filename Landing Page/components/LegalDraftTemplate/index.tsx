import { useState } from 'react'
import styles from './LegalDraftTemplate.module.sass'
import Image from 'next/image'
import cn from 'classnames'

const LegalDraftTemplate = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [customizations, setCustomizations] = useState({})
    const [isGenerating, setIsGenerating] = useState(false)
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)

    const handleGenerate = async () => {
        if (!disclaimerAccepted) {
            // Show error or notification that user needs to accept disclaimer
            return
        }
        // ... rest of the existing generate function ...
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.content}>
                    <h2 className={styles.title}>Choose a Template</h2>
                    
                    <div className={styles.templateGrid}>
                        {/* ... existing template selection JSX ... */}
                    </div>
                    
                    {selectedTemplate && (
                        <div className={styles.customizationSection}>
                            {/* ... existing customization fields JSX ... */}
                        </div>
                    )}
                    
                    <div className={styles.legalDisclaimer}>
                        <div className={styles.disclaimerAccordion}>
                            <button 
                                className={styles.disclaimerHeader} 
                                onClick={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
                            >
                                <div className={styles.headerContent}>
                                    <div className={styles.disclaimerTitle}>Legal Disclaimer</div>
                                    <Image 
                                        src="/icons/chevron-down.svg"
                                        alt="Toggle"
                                        width={24}
                                        height={24}
                                        className={`${styles.chevron} ${isDisclaimerOpen ? styles.open : ''}`}
                                    />
                                </div>
                            </button>
                            
                            <div className={`${styles.disclaimerContent} ${isDisclaimerOpen ? styles.open : ''}`}>
                                <div className={styles.disclaimerText}>
                                    <p>This website provides tools for creating and analyzing legal documents for informational purposes only. It does not offer legal advice, representation, or services in any jurisdiction.</p>
                                    <p>No attorney-client relationship is established through the use of this website. The documents, templates, and analyses generated are not a substitute for professional legal advice. Laws and regulations vary across jurisdictions and are subject to change. We do not guarantee the completeness, accuracy, or suitability of any content for your specific legal needs.</p>
                                    <p>You acknowledge that any reliance on the materials provided is at your own risk. We disclaim all liability for any errors, omissions, or outcomes resulting from the use of this website. For legally binding advice and document validation, always consult a qualified legal professional.</p>
                                    <p>By using this website, you agree to these terms and accept full responsibility for any decisions made based on the content provided.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.acceptanceRow}>
                            <label className={styles.checkbox}>
                                <input 
                                    type="checkbox"
                                    checked={disclaimerAccepted}
                                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                                />
                                <span className={styles.checkmark}></span>
                                <span className={styles.label}>I have read and accept the legal disclaimer</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className={styles.actionsRow}>
                        <button 
                            onClick={handleGenerate}
                            className={cn(styles.generateButton, { 
                                [styles.generating]: isGenerating,
                                [styles.disabled]: !disclaimerAccepted
                            })}
                            disabled={isGenerating || !selectedTemplate || !disclaimerAccepted}
                        >
                            Generate from Template &nbsp;→
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LegalDraftTemplate 