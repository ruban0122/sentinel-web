'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddCompanyPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        address: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Get the logged-in user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('You must be logged in to create a company')
            setLoading(false)
            return
        }

        const { error } = await supabase.from('companies').insert({
            id: crypto.randomUUID(),
            name: formData.name,
            address: formData.address || null,
            created_by: user.id,
            created_at: new Date().toISOString()
        })

        if (error) {
            alert('Error creating company: ' + error.message)
            setLoading(false)
        } else {
            router.push('/settings/companies')
        }
    }

    return (
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/settings/companies"
                    className="btn btn-ghost"
                    style={{ marginBottom: '1rem', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', height: 'auto' }}
                >
                    <ArrowLeft size={16} />
                    Back to Companies
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add New Company</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                    Create a new company to manage sites, workers, and operations
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div style={{
                            height: '3.5rem',
                            width: '3.5rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--primary), 0.05))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid hsla(var(--primary), 0.2)'
                        }}>
                            <Building2 size={24} style={{ color: 'hsl(var(--primary))' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Company Information</h2>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                                Enter the company details below
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                                color: 'hsl(var(--foreground))'
                            }}>
                                Company Name <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., ABC Construction Ltd"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    fontSize: '0.875rem',
                                    background: 'hsl(var(--background))'
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.375rem' }}>
                                The official name of your company
                            </p>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                                color: 'hsl(var(--foreground))'
                            }}>
                                Address (Optional)
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g., 123 Main Street, City, Country"
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    fontSize: '0.875rem',
                                    background: 'hsl(var(--background))',
                                    resize: 'vertical'
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.375rem' }}>
                                The registered address of your company
                            </p>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid hsl(var(--border))',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }}>
                        <Link href="/settings/companies" className="btn btn-ghost">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ gap: '0.5rem' }}
                        >
                            <Save size={16} />
                            {loading ? 'Creating...' : 'Create Company'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
