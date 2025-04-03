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
                    router.push('/auth/signin');
                    return;
                }

                if (session) {
                    router.push('/contracts');
                } else {
                    router.push('/auth/signin');
                }
            } catch (error) {
                console.error('Error handling callback:', error);
                router.push('/auth/signin');
            }
        };

        handleCallback();
    }, [router, supabase.auth]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        </div>
    )
} 