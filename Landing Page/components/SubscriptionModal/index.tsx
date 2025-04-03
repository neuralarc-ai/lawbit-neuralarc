import React, { useState, useEffect } from 'react';
import styles from './SubscriptionModal.module.sass';
import { createClient } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Payment Form Component
const PaymentForm = ({ priceId, onSuccess, onCancel }: { 
    priceId: string; 
    onSuccess: (sessionId: string) => void; 
    onCancel: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Get current user
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user?.id,
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Confirm payment with the payment method
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/payment/success',
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            // Check if payment was successful
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // If we get here, payment was successful
                onSuccess(data.clientSecret);
            } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
                // Payment failed because the payment method was invalid
                throw new Error('Your payment method was declined. Please try another payment method.');
            } else {
                // Payment is still processing
                throw new Error('Payment is still processing. Please wait a moment and try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Payment failed. Please try again.');
            console.error('Payment error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
            <PaymentElement />
            
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}
            
            <div className={styles.paymentButtons}>
                <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className={styles.payButton}
                    disabled={!stripe || isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
        </form>
    );
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [tokensAdded, setTokensAdded] = useState<number | null>(null);
    const [newBalance, setNewBalance] = useState<number | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // Check for session_id in URL when component mounts
    useEffect(() => {
        if (isOpen) {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session_id');
            
            if (sessionId) {
                handlePaymentSuccess(sessionId);
                
                // Clean up URL without refreshing the page
                const newUrl = window.location.pathname;
                window.history.pushState({}, '', newUrl);
            }
        }
    }, [isOpen]);

    const handlePaymentSuccess = async (sessionId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Call our API to add tokens
            const response = await fetch('/api/add-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });
            
            const data = await response.json();
            
            if (data.error) {
                // If payment is still processing, retry after a delay
                if (data.error.includes('still processing')) {
                    // Wait for 3 seconds
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Retry the request
                    const retryResponse = await fetch('/api/add-tokens', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ sessionId }),
                    });
                    
                    const retryData = await retryResponse.json();
                    
                    if (retryData.error) {
                        throw new Error(retryData.error);
                    }
                    
                    // If we get here, the retry was successful
                    setPaymentSuccess(true);
                    setTokensAdded(retryData.tokensAdded);
                    setNewBalance(retryData.newBalance);
                    
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        onClose();
                        setPaymentSuccess(false);
                        setTokensAdded(null);
                        setNewBalance(null);
                        setSelectedPlan(null);
                        setClientSecret(null);
                    }, 3000);
                    
                    return;
                }
                
                // If payment requires a payment method, we need to go back to the payment form
                if (data.error.includes('requires_payment_method')) {
                    setError('Your payment method was declined. Please try another payment method.');
                    setSelectedPlan(null);
                    setClientSecret(null);
                    return;
                }
                
                throw new Error(data.error);
            }
            
            setPaymentSuccess(true);
            setTokensAdded(data.tokensAdded);
            setNewBalance(data.newBalance);
            
            // Close modal after 3 seconds
            setTimeout(() => {
                onClose();
                setPaymentSuccess(false);
                setTokensAdded(null);
                setNewBalance(null);
                setSelectedPlan(null);
                setClientSecret(null);
            }, 3000);
            
        } catch (err: any) {
            console.error('Payment processing error:', err);
            setError(`Failed to process payment: ${err.message || 'Unknown error'}. Please contact support.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanSelect = async (priceId: string) => {
        setSelectedPlan(priceId);
        
        try {
            setIsLoading(true);
            setError(null);

            // Get current user
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user?.id,
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setClientSecret(data.clientSecret);
        } catch (err: any) {
            setError(err.message || 'Failed to initialize payment. Please try again.');
            console.error('Payment initialization error:', err);
            setSelectedPlan(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelPayment = () => {
        setSelectedPlan(null);
        setClientSecret(null);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {selectedPlan ? 'Complete Your Payment' : 'Choose Your Plan'}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}
                
                {paymentSuccess ? (
                    <div className={styles.successMessage}>
                        <div className={styles.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 className={styles.successTitle}>Payment Successful!</h3>
                        <p className={styles.successText}>
                            {tokensAdded?.toLocaleString()} tokens have been added to your account.
                        </p>
                        <p className={styles.successBalance}>
                            Your new token balance: {newBalance?.toLocaleString()}
                        </p>
                    </div>
                ) : selectedPlan && clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm 
                            priceId={selectedPlan} 
                            onSuccess={handlePaymentSuccess} 
                            onCancel={handleCancelPayment} 
                        />
                    </Elements>
                ) : (
                    <div className={styles.subscriptionCards}>
                        <div className={styles.subscriptionCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>Plus</h3>
                                <div className={styles.priceContainer}>
                                    <span className={styles.price}>$14.99</span>
                                    <span className={styles.period}>/one-time</span>
                                </div>
                            </div>
                            <ul className={styles.featuresList}>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>250,000 tokens</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Priority support</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Advanced analytics</span>
                                </li>
                            </ul>
                            <button 
                                className={styles.subscribeButton}
                                onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_LAWBIT_PLUS_PRODUCT_ID!)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Purchase Now'}
                            </button>
                        </div>
                        
                        <div className={styles.subscriptionCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>Ultra</h3>
                                <div className={styles.priceContainer}>
                                    <span className={styles.price}>$24.99</span>
                                    <span className={styles.period}>/one-time</span>
                                </div>
                            </div>
                            <ul className={styles.featuresList}>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>600,000 tokens</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Usage History</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Advanced contract analysis</span>
                                </li>
                            </ul>
                            <button 
                                className={styles.subscribeButton}
                                onClick={() => handlePlanSelect(process.env.NEXT_PUBLIC_LAWBIT_ULTA_PRODUCT_ID!)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Purchase Now'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionModal; 