'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../auth.module.sass'
import { updatePassword } from '@/services/authService'
import { useToast } from '@/components/Toast/Toaster'

export default function ResetPassword() {
    const { showToast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const { error } = await updatePassword(formData.password)
            
            if (error) {
                showToast(error.message)
                return
            }

            showToast('Password updated successfully!')
            router.push('/auth/signin')
        } catch (error: any) {
            showToast(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Confirm New Password</label>
                <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                />
            </div>

            <button 
                type="submit" 
                className={`${styles.button} ${loading ? styles.analyzing : ''}`}
                disabled={loading}
            >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
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