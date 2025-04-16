import React, { useEffect } from 'react'
import styles from './LegalDisclaimer.module.sass'
import { toast } from 'react-hot-toast'
import cn from 'classnames'

interface LegalDisclaimerProps {
    isAccepted: boolean
    onAccept: (value: boolean) => void
    isOpen: boolean
    onToggle: () => void
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({
    isAccepted,
    onAccept,
    isOpen,
    onToggle
}) => {
    return (
        <div className={styles.legalDisclaimer}>
            <div className={styles.disclaimerAccordion}>
                <button 
                    className={cn(styles.disclaimerButton, {
                        [styles.open]: isOpen
                    })}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    aria-expanded={isOpen}
                >
                    <div className={styles.headerContent}>
                        <div className={styles.disclaimerTitle}>
                            Legal Disclaimer
                            {!isAccepted && 
                                <span className={styles.requiredBadge} role="status">Required</span>
                            }
                        </div>
                        <svg
                            className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </button>
                
                <div 
                    id="disclaimer-content"
                    className={`${styles.disclaimerContent} ${isOpen ? styles.open : ''}`}
                    role="region"
                    aria-labelledby="disclaimer-title"
                >
                    <div className={styles.disclaimerText}>
                        <p>
                            This service is provided for informational purposes only and does not constitute legal advice.
                            The generated documents are templates and should be reviewed by a qualified legal professional
                            before use.
                        </p>
                        <p>
                            By using this service, you acknowledge that you understand the limitations of AI-generated
                            legal documents and agree to consult with a legal professional for specific legal advice.
                        </p>
                        <p>
                            The creators of this service are not responsible for any legal consequences resulting from
                            the use of these documents.
                        </p>
                    </div>
                    <div 
                        className={styles.acceptanceRow}
                        role="group"
                        aria-label="Disclaimer acceptance"
                    >
                        <label className={styles.checkbox}>
                            <input 
                                type="checkbox"
                                checked={isAccepted}
                                onChange={(e) => onAccept(e.target.checked)}
                                aria-label="I accept the legal disclaimer"
                            />
                            <span className={`${styles.checkmark} ${isAccepted ? styles.checked : ''}`} />
                        </label>
                        <span className={styles.acceptanceLabel}>
                            I have read and understand the legal disclaimer
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LegalDisclaimer 