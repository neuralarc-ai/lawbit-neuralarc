'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import styles from '../auth.module.sass'

export default function SignIn() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle sign in logic here
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="example@email.com"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>

            <div style={{ width: '100%', textAlign: 'right' }}>
                <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                    Forgot password?
                </Link>
            </div>

            <button type="submit" className={styles.button}>
                <span>Log In</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </form>
    )
} 