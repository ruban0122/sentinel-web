'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddWorkerPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        worker_code: '',
        rfid_tag: '',
        site_id: '',
        status: 'active',
        section: ''
    })

    const [sites, setSites] = useState<any[]>([])

    useEffect(() => {
        async function fetchSites() {
            const { data } = await supabase.from('sites').select('id, name')
            if (data) setSites(data)
        }
        fetchSites()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('workers').insert({
            id: crypto.randomUUID(),
            ...formData
        })

        if (error) {
            alert('Error adding worker: ' + error.message)
            setLoading(false)
        } else {
            router.push('/workers')
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/workers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Back to Workers
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add New Worker</h1>
            </div>

            <form onSubmit={handleSubmit} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Worker Code</label>
                        <input
                            type="text"
                            value={formData.worker_code}
                            onChange={e => setFormData({ ...formData, worker_code: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>RFID Tag ID</label>
                        <input
                            type="text"
                            value={formData.rfid_tag}
                            onChange={e => setFormData({ ...formData, rfid_tag: e.target.value })}
                            placeholder="Scan Tag..."
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Assign Site</label>
                    <select
                        value={formData.site_id}
                        onChange={e => setFormData({ ...formData, site_id: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                    >
                        <option value="">Select a Site...</option>
                        {sites.map(site => (
                            <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Section / Floor</label>
                    <input
                        type="text"
                        value={formData.section}
                        onChange={e => setFormData({ ...formData, section: e.target.value })}
                        placeholder="e.g. Floor 3, Zone A"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                    />
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href="/workers" className="btn btn-ghost" style={{ border: '1px solid hsl(var(--border))' }}>Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Worker'}
                    </button>
                </div>
            </form>
        </div>
    )
}
