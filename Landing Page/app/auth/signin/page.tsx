'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../auth.module.sass'
import { signIn } from '@/services/authService'
import { useToast } from '@/components/Toast/Toaster'

export default function SignIn() {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await signIn(formData.email, formData.password)
            
            if (error) {
                showToast(error.message)
                return
            }

            router.push('/contracts')
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </div>

            <div className={styles.forgotPassword}>
                <Link href="/auth/forgot-password">Forgot Password?</Link>
            </div>

            <button 
                type="submit" 
                className={`${styles.button} ${loading ? styles.analyzing : ''}`}
                disabled={loading}
            >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </form>
    )
} 