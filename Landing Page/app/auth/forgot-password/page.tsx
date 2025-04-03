'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import styles from '../auth.module.sass'
import { resetPassword } from '@/services/authService'
import { useToast } from '@/components/Toast/Toaster'

export default function ForgotPassword() {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await resetPassword(email)
            
            if (error) {
                showToast(error.message)
                return
            }

            showToast('Check your email for password reset instructions')
        } catch (error: any) {
            showToast(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                    type="email"
                    className={styles.input}
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <button 
                type="submit" 
                className={`${styles.button} ${loading ? styles.analyzing : ''}`}
                disabled={loading}
            >
                <span>{loading ? 'Sending...' : 'Reset Password'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <div className={styles.forgotPassword}>
                <Link href="/auth/signin">Back to Sign In</Link>
            </div>
        </form>
    )
} 