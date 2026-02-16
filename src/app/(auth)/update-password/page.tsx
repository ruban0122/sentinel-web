'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [verifyingSession, setVerifyingSession] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    // Verify session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError("Invalid or expired password reset link. Please try again.")
            }
            setVerifyingSession(false)
        }
        checkSession()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setLoading(false)
            setSuccess(true)
            // Optional: Sign out so they have to log in with new password, or redirect to dashboard
            // Usually nice to redirect to dashboard or login. 
            // Since they are technically logged in now, Dashboard is fine, but asking to Login again is safer feeling.
            // Let's redirect to Dashboard for convenience.
            setTimeout(() => router.push('/dashboard'), 2000)
        }
    }

    if (verifyingSession) {
        return (
            <div className="card glass-panel" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
                <div className="loading-spinner" />
                <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Verifying link...</p>
            </div>
        )
    }

    return (
        <div className="card glass-panel" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <ShieldCheck size={24} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Update Password</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Create a new secure password for your account
                </p>
            </div>

            {error && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(var(--destructive), 0.1)', color: 'hsl(var(--destructive))', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!success ? (
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                            placeholder="Re-enter password"
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading || !!error && error.includes('Invalid or expired')} style={{ width: '100%' }}>
                        {loading ? 'Updating...' : 'Set Password'}
                    </button>
                    {error && error.includes('Invalid or expired') && (
                        <div style={{ textAlign: 'center' }}>
                            <Link href="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--primary))' }}>
                                Request new link <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}
                </form>
            ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3rem', height: '3rem', borderRadius: '50%', background: 'hsla(142, 71%, 45%, 0.1)', color: 'hsl(142, 71%, 45%)', marginBottom: '1rem' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password Updated!</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Your password has been successfully reset. Redirecting you to the dashboard...
                    </p>
                </div>
            )}
        </div>
    )
}
