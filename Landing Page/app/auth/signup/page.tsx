'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.sass'
import { signUp } from '@/services/authService'
import { useToast } from '@/components/Toast/Toaster'
import PasswordStrength from '@/components/PasswordStrength/PasswordStrength'

export default function SignUp() {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        mobile: ''
    })

    const validatePassword = (password: string): boolean => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        
        return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validatePassword(formData.password)) {
            showToast('Please ensure your password meets all requirements')
            return
        }

        setLoading(true)

        try {
            console.log('Submitting signup form:', formData)
            const { data, error } = await signUp(formData.email, formData.password, formData.fullName)
            
            if (error) {
                console.error('Signup error:', error)
                showToast(error.message || 'Failed to sign up. Please try again.')
                return
            }

            if (data?.user) {
                console.log('Signup successful:', data)
                showToast('Check your email to confirm your account')
                router.push('/auth/signin')
            } else {
                console.error('No user data returned')
                showToast('Signup failed. Please try again.')
            }
        } catch (error: any) {
            console.error('Signup caught error:', error)
            showToast(error.message || 'An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                />
            </div>

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
                <PasswordStrength password={formData.password} />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Mobile No.</label>
                <input
                    type="tel"
                    className={styles.input}
                    placeholder="9966701238"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
            </div>

            <button 
                type="submit" 
                className={`${styles.button} ${loading ? styles.analyzing : ''}`}
                disabled={loading}
            >
                <span>{loading ? 'Signing up...' : 'Sign Up'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </form>
    )
} 