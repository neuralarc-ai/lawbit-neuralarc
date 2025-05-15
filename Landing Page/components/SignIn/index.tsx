import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle } from '@/services/authService';
import { useToast } from '@/components/Toast/Toaster';
import Navbar from '../Navbar';
import Footer from '../Footer';
import styles from './SignIn.module.sass';

const SignIn = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({ email: '', password: '' });

        try {
            const { error } = await signIn(formData.email, formData.password);
            if (error) {
                throw new Error(error.message);
            }
            router.push('/contracts');
        } catch (error: any) {
            setErrors({
                email: error.message.includes('email') ? error.message : '',
                password: error.message.includes('password') ? error.message : ''
            });
            showToast({
                type: 'error',
                message: error.message || 'Failed to sign in'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                throw new Error(error.message);
            }
        } catch (error: any) {
            showToast({
                type: 'error',
                message: error.message || 'Failed to sign in with Google'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.mainContent}>
                <motion.div
                    className={styles.signInContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className={styles.title}>Sign In</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            {errors.email && <span className={styles.error}>{errors.email}</span>}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            {errors.password && <span className={styles.error}>{errors.password}</span>}
                        </div>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className={styles.googleButton}
                        disabled={isLoading}
                    >
                        <img 
                            src="/google-icon.svg" 
                            alt="Google" 
                            className={styles.googleIcon}
                        />
                        Sign in with Google
                    </button>

                    <div className={styles.links}>
                        <a href="/auth/forgot-password" className={styles.forgotPassword}>
                            Forgot Password?
                        </a>
                        <a href="/auth/signup" className={styles.signUp}>
                            Don't have an account? Sign Up
                        </a>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default SignIn; 