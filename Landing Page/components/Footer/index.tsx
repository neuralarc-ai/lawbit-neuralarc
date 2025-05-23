import React from 'react'
import Link from 'next/link'
import styles from './Footer.module.sass'
import Image from 'next/image'

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
    return (
        <footer className={`${styles.footer} ${className || ''}`}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.links}>
                        <Link href="/terms">Terms of use</Link>
                        <span>•</span>
                        <Link href="/privacy">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="/disclaimer">AI Enabled Content Notice</Link>
                        <span>•</span>
                        <Link href="/responsible-ai">Responsible AI</Link>
                    </div>
                    <div className={styles.copyright}>
                        <p>
                            Copyright 2025. All rights reserved. &nbsp;&nbsp; Lawbit AI, A thing by&nbsp;
                        </p>
                        <div className={styles.trademarkContainer}>
                            <Image 
                                src="/neuralpath.svg" 
                                alt="Neural Paths" 
                                width={140} 
                                height={60} 
                            />
                            <span className={styles.trademark}>TM</span>
                        </div>
                    </div>
                     
                </div>
            </div>
        </footer>
    )
}

export default Footer


