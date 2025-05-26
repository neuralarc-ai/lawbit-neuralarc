'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast/Toaster'

export default function AuthCallback() {
    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Error getting session:', error);
                    showToast('Authentication error: Failed to verify your session. Please try again.');
                    router.push('/auth/signin');
                    return;
                }

                if (session) {
                    showToast('Welcome back! You have been successfully signed in.');
                    router.push('/contracts');
                } else {
                    router.push('/auth/signin');
                }
            } catch (error) {
                console.error('Error handling callback:', error);
                showToast('An unexpected error occurred. Please try again.');
                router.push('/auth/signin');
            }
        };

        // Add a small delay to show the loading state
        const timer = setTimeout(() => {
            handleCallback();
        }, 1000);

        return () => clearTimeout(timer);
    }, [router, supabase.auth, showToast]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto relative">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-2 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Just a moment</h1>
                <p className="text-gray-600 mb-6">We're verifying your details...</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full animate-[pulse_2s_ease-in-out_infinite] w-full"></div>
                </div>
            </div>
        </div>
    )
}