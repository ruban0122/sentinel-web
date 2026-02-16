'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [companyId, setCompanyId] = useState('')
    const [companies, setCompanies] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchCompanies() {
            const { data, error } = await supabase.from('companies').select('id, name')
            if (data) setCompanies(data)
            if (error) console.error('Error fetching companies:', error)
        }
        fetchCompanies()
    }, [])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        company_id: companyId
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No user returned from signup')

            // 2. Create User Profile in public.users
            const { error: profileError } = await supabase.from('users').insert({
                id: crypto.randomUUID(), // User schema uses text ID, likely UUIDv4. 
                uid: authData.user.id,
                email: email,
                name: name,
                role: 'admin', // Defaulting to admin for Signup flow for now
                phone_number: phone,
                company_id: companyId,
                created_at: new Date().toISOString()
            })

            if (profileError) {
                // Note: In a real app we might want to rollback auth user creation or handle this gracefully.
                console.error('Error creating profile:', profileError)
                throw new Error('Account created but profile setup failed: ' + profileError.message)
            }

            // Success
            router.push('/dashboard')

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card glass-panel">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>
                    S
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Get started with Sentinel Admin</p>
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(0, 84%, 60%, 0.1)', color: 'hsl(0, 84%, 60%)', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        placeholder="admin@company.com"
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

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        placeholder="+1 234 567 8900"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Company</label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none', appearance: 'none' }}
                        >
                            <option value="">Select your company...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    {companies.length === 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                            No companies found. Please contact support or insert a company in DB.
                        </p>
                    )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Already have an account? </span>
                <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>Sign in</Link>
            </div>
        </div>
    )
}
