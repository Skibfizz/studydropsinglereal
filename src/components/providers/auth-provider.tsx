'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient_browser } from '@/lib/supabase'

// Auth context type
type AuthContextType = {
	user: User | null
	loading: boolean
	signOut: () => Promise<void>
	signIn: {
		email: (email: string, redirectTo?: string) => Promise<void>
		google: (redirectTo?: string) => Promise<void>
		github: (redirectTo?: string) => Promise<void>
	}
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	signOut: async () => {},
	signIn: {
		email: async () => {},
		google: async () => {},
		github: async () => {}
	}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const supabase = createClient_browser()

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession()
				setUser(session?.user ?? null)
			} catch (error) {
				console.error('Error getting session:', error)
			} finally {
				setLoading(false)
			}
		}

		getInitialSession()

		// Listen for auth state changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null)
			setLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [supabase])

	// Auth functions
	const signOut = async () => {
		await supabase.auth.signOut()
	}

	const emailSignIn = async (email: string, redirectTo: string = '/dashboard') => {
		await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${window.location.origin}${redirectTo}`
			}
		})
	}

	const googleSignIn = async (redirectTo: string = '/dashboard') => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}${redirectTo}`
			}
		})
	}

	const githubSignIn = async (redirectTo: string = '/dashboard') => {
		await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${window.location.origin}${redirectTo}`
			}
		})
	}

	return (
		<AuthContext.Provider 
			value={{ 
				user, 
				loading,
				signOut,
				signIn: {
					email: emailSignIn,
					google: googleSignIn,
					github: githubSignIn
				}
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

// Custom hook for using auth
export const useAuth = () => useContext(AuthContext) 