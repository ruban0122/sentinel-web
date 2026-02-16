'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="card glass-panel">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>
                    S
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome Back</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Sign in to Sentinel Admin</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'hsl(0, 84%, 60%)', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        placeholder="admin@example.com"
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <Link href="/forgot-password" style={{ color: 'hsl(var(--muted-foreground))' }}>Forgot password?</Link>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Don't have an account? </span>
                <Link href="/signup" style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>Sign up</Link>
            </div>
        </div>
    )
}
