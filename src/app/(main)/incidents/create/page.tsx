'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateIncidentPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        description: '',
        worker_id: '',
        site_id: '',
        date: new Date().toISOString().split('T')[0]
    })

    // Data Selectors
    const [workers, setWorkers] = useState<any[]>([])
    const [sites, setSites] = useState<any[]>([])

    useEffect(() => {
        async function fetchData() {
            const [workersRes, sitesRes] = await Promise.all([
                supabase.from('workers').select('id, name, company_id'),
                supabase.from('sites').select('id, name')
            ])

            if (workersRes.data) setWorkers(workersRes.data)
            if (sitesRes.data) setSites(sitesRes.data)
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const selectedWorker = workers.find(w => w.id === formData.worker_id)
        const selectedSite = sites.find(s => s.id === formData.site_id)

        const { error } = await supabase.from('incidents').insert({
            id: crypto.randomUUID(),
            description: formData.description,
            worker_id: formData.worker_id,
            worker_name: selectedWorker?.name,
            site_id: formData.site_id,
            site_name: selectedSite?.name, // Denormalizing as per schema implication
            company_id: selectedWorker?.company_id,
            date: new Date(formData.date).toISOString(),
            created_at: new Date().toISOString()
        })

        if (error) {
            alert('Error reporting incident: ' + error.message)
            setLoading(false)
        } else {
            router.push('/incidents')
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Back to Incidents
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Report New Incident</h1>
            </div>

            <form onSubmit={handleSubmit} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none', resize: 'vertical' }}
                        placeholder="Describe what happened..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Worker Involved</label>
                        <select
                            value={formData.worker_id}
                            onChange={e => setFormData({ ...formData, worker_id: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        >
                            <option value="">Select Worker...</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Location (Site)</label>
                        <select
                            value={formData.site_id}
                            onChange={e => setFormData({ ...formData, site_id: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        >
                            <option value="">Select Site...</option>
                            {sites.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Date of Incident</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                    />
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href="/incidents" className="btn btn-ghost" style={{ border: '1px solid hsl(var(--border))' }}>Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    )
}
