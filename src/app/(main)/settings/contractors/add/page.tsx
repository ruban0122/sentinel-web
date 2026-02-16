'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Briefcase, Hash, Save } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUserCompanyIdClient } from '@/lib/auth-utils-client'

export default function AddContractorPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        company_worker_code: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Get user's company_id
        const companyId = await getCurrentUserCompanyIdClient(supabase)

        if (!companyId) {
            alert('Your account is not associated with a company.')
            setLoading(false)
            return
        }

        const { error } = await supabase.from('contractors').insert({
            id: crypto.randomUUID(),
            name: formData.name,
            company_worker_code: formData.company_worker_code,
            company_id: companyId,
            floor_id: null,
            created_at: new Date().toISOString()
        })

        if (error) {
            alert('Error creating contractor: ' + error.message)
            setLoading(false)
        } else {
            router.push('/settings/contractors')
        }
    }

    return (
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/settings/contractors"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', textDecoration: 'none' }}
                    className="btn btn-ghost"
                >
                    <ArrowLeft size={16} />
                    Back to Contractors
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add New Contractor</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Create a new contractor profile. You can assign a floor later.</p>
            </div>

            <form onSubmit={handleSubmit} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                            Contractor Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. ABC Construction Services"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Hash size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                            Company Worker Code
                        </label>
                        <input
                            type="text"
                            value={formData.company_worker_code}
                            onChange={e => setFormData({ ...formData, company_worker_code: e.target.value })}
                            placeholder="e.g. ABC-001 (optional)"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem', fontFamily: 'monospace' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            Optional unique identifier for this contractor
                        </p>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', background: 'hsla(var(--muted), 0.2)', borderTop: '1px solid hsla(var(--border), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link
                        href="/settings/contractors"
                        className="btn btn-ghost"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ gap: '0.5rem' }}
                    >
                        {loading ? (
                            <>Creating...</>
                        ) : (
                            <>
                                <Save size={16} />
                                Create Contractor
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
