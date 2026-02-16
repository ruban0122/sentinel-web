'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Building, Save } from 'lucide-react'
import Link from 'next/link'

export default function AddSitePage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Get the logged-in user's company_id
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('You must be logged in to create a site')
            setLoading(false)
            return
        }

        const { data: userData } = await supabase
            .from('users')
            .select('company_id')
            .eq('uid', user.id)
            .single()

        if (!userData?.company_id) {
            alert('Your account is not associated with a company')
            setLoading(false)
            return
        }

        const { error } = await supabase.from('sites').insert({
            id: crypto.randomUUID(),
            name: formData.name,
            company_id: userData.company_id,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            status: 'active',
            created_at: new Date().toISOString()
        })

        if (error) {
            alert('Error creating site: ' + error.message)
            setLoading(false)
        } else {
            router.push('/settings/sites')
        }
    }

    return (
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/settings/sites"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    className="btn btn-ghost"
                >
                    <ArrowLeft size={16} />
                    Back to Sites
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add New Site</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Create a new location to manage sections, floors, and workers.</p>
            </div>

            <form onSubmit={handleSubmit} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                            Site Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Headquarters, North Warehouse"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="0.000000"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem', fontFamily: 'monospace' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="0.000000"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem', fontFamily: 'monospace' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', background: 'hsla(var(--muted), 0.2)', borderTop: '1px solid hsla(var(--border), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link
                        href="/settings/sites"
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
                                Create Site
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
