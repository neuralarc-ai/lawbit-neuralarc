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
                const { error } = await supabase.auth.exchangeCodeForSession(window.location.hash)
                if (error) {
                    console.error('Auth callback error:', error)
                    showToast('Failed to verify email. Please try again.')
                    router.push('/auth/signin')
                    return
                }

                showToast('Email verified successfully!')
                router.push('/contracts')
            } catch (error: any) {
                console.error('Auth callback error:', error)
                showToast('An unexpected error occurred. Please try again.')
                router.push('/auth/signin')
            }
        }

        handleCallback()
    }, [router, showToast])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        </div>
    )
} 