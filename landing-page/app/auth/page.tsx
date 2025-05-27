'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthDefault() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/auth/signin')
    }, [router])

    return null
} 