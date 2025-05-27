'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type SupabaseContextType = {
  user: User | null
  loading: boolean
  supabase: SupabaseClient
}

const supabase = createClient()

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  supabase,
})

export const useSupabase = () => {
  return useContext(SupabaseContext)
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ user, loading, supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
} 