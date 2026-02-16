'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setLoading(false)
            setSuccess(true)
        }
    }

    return (
        <div className="card glass-panel" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <KeyRound size={24} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Forgot Password</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Enter your email to receive a password reset link
                </p>
            </div>

            {error && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(var(--destructive), 0.1)', color: 'hsl(var(--destructive))', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!success ? (
                <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </form>
            ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3rem', height: '3rem', borderRadius: '50%', background: 'hsla(142, 71%, 45%, 0.1)', color: 'hsl(142, 71%, 45%)', marginBottom: '1rem' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Check your email</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
                    </p>
                    <Link href="/login" className="btn btn-ghost" style={{ width: '100%' }}>
                        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Return to Login
                    </Link>
                </div>
            )}
        </div>
    )
}
