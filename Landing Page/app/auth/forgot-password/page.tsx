'use client'

import React, { useState } from 'react'
import styles from '../auth.module.sass'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle forgot password logic here
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter Registered Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <button type="submit" className={styles.button}>
                <span>Done</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </form>
    )
} 