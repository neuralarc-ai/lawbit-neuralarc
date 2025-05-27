import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast/Toaster'

export const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = createClient()
    try {
        console.log('Attempting signup with:', { email, fullName })
        
        // First, check if the email already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error checking existing user:', checkError)
            throw new Error('Failed to check existing user')
        }

        if (existingUser) {
            throw new Error('Email already registered')
        }

        // Proceed with signup
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error('Signup error:', error)
            throw error
        }

        console.log('Signup successful:', data)
        return { data, error: null }
    } catch (error: any) {
        console.error('Signup caught error:', error)
        return { 
            data: null, 
            error: {
                message: error.message || 'An unexpected error occurred during signup'
            }
        }
    }
}

export const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    try {
        console.log('Attempting signin with:', { email })
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Signin error:', error)
            throw error
        }

        console.log('Signin successful:', data)
        return { data, error: null }
    } catch (error: any) {
        console.error('Signin caught error:', error)
        return { 
            data: null, 
            error: {
                message: error.message || 'An unexpected error occurred during signin'
            }
        }
    }
}

export const resetPassword = async (email: string) => {
    const supabase = createClient()
    try {
        console.log('Attempting password reset for:', { email })
        
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
            console.error('Password reset error:', error)
            throw error
        }

        console.log('Password reset successful:', data)
        return { data, error: null }
    } catch (error: any) {
        console.error('Password reset caught error:', error)
        return { 
            data: null, 
            error: {
                message: error.message || 'An unexpected error occurred during password reset'
            }
        }
    }
}

export const updatePassword = async (password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
        password: password
    })
    return { error }
}

export const signInWithGoogle = async () => {
    const supabase = createClient()
    try {
        console.log('Attempting Google signin')
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })

        if (error) {
            console.error('Google signin error:', error)
            throw error
        }

        console.log('Google signin initiated:', data)
        return { data, error: null }
    } catch (error: any) {
        console.error('Google signin caught error:', error)
        return { 
            data: null, 
            error: {
                message: error.message || 'An unexpected error occurred during Google signin'
            }
        }
    }
} 