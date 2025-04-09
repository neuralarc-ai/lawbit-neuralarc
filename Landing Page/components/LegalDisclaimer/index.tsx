import { useState } from 'react'
import cn from 'classnames'
import styles from './LegalDisclaimer.module.sass'
import Image from '@/components/Image'

interface LegalDisclaimerProps {
    onAccept: (accepted: boolean) => void
    isAccepted: boolean
}

const LegalDisclaimer = ({ onAccept, isAccepted }: LegalDisclaimerProps) => {
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)

    return (
        <div className={styles.legalDisclaimer}>
            <div className={styles.disclaimerAccordion}>
                <button 
                    className={styles.disclaimerHeader} 
                    onClick={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
                >
                    <div className={styles.headerContent}>
                        <h3 className={styles.disclaimerTitle}>Legal Disclaimer</h3>
                        <Image 
                            src="/images/chevron-down.svg"
                            width={24}
                            height={24}
                            alt="Toggle"
                            className={cn(styles.chevron, {
                                [styles.open]: isDisclaimerOpen
                            })}
                        />
                    </div>
                </button>
                
                <div className={cn(styles.disclaimerContent, {
                    [styles.open]: isDisclaimerOpen
                })}>
                    <div className={styles.disclaimerText}>
                        <p>
                            This AI-powered legal document generator is designed to provide general legal document templates and assistance. While we strive for accuracy and completeness, please note the following important points:
                        </p>
                        <p>
                            1. Not Legal Advice: The generated documents and information provided are not substitutes for professional legal advice. Consult with a qualified legal professional for specific legal matters.
                        </p>
                        <p>
                            2. No Attorney-Client Relationship: Use of this service does not create an attorney-client relationship between you and our platform or any affiliated parties.
                        </p>
                        <p>
                            3. Accuracy & Completeness: While we make efforts to keep information up-to-date and accurate, we cannot guarantee the completeness, accuracy, or adequacy of the generated documents for your specific needs.
                        </p>
                        <p>
                            4. Review Requirement: All generated documents should be thoroughly reviewed by a qualified legal professional before use or implementation.
                        </p>
                    </div>
                </div>
            </div>
            
            <label className={cn(styles.checkbox, styles.acceptanceRow)}>
                <input 
                    type="checkbox"
                    checked={isAccepted}
                    onChange={(e) => onAccept(e.target.checked)}
                />
                <span className={styles.checkmark}></span>
                <span className={styles.label}>
                    I understand and accept the legal disclaimer
                </span>
            </label>
        </div>
    )
}

export default LegalDisclaimer 