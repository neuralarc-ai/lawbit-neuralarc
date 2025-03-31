'use client'

import React, { useState } from 'react'
import styles from '../auth.module.sass'

export default function SignUp() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        mobile: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle sign up logic here
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
                />
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

            <button type="submit" className={styles.button}>
                <span>Sign Up</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </form>
    )
} 