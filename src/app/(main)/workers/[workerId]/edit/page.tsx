'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function EditWorkerPage() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const router = useRouter()
    const params = useParams()
    const workerId = params.workerId as string
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        worker_code: '',
        rfid_tag: '',
        site_id: '',
        status: 'active',
        section: '' // Assuming 'section' column exists, or we might need to use metadata
    })

    const [sites, setSites] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            setFetching(true)

            // Fetch Sites
            const { data: sitesData } = await supabase.from('sites').select('id, name')
            if (sitesData) setSites(sitesData)

            // Fetch Worker
            const { data: worker, error } = await supabase
                .from('workers')
                .select('*')
                .eq('id', workerId)
                .single()

            if (worker) {
                setFormData({
                    name: worker.name || '',
                    worker_code: worker.worker_code || '',
                    rfid_tag: worker.rfid_tag || '',
                    site_id: worker.site_id || '',
                    status: worker.status || 'active',
                    section: worker.section || ''
                })
            } else if (error) {
                console.error(error)
                alert('Error loading worker')
                router.push('/workers')
            }
            setFetching(false)
        }
        loadData()
    }, [workerId, supabase, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from('workers')
            .update(formData)
            .eq('id', workerId)

        if (error) {
            alert('Error updating worker: ' + error.message)
            setLoading(false)
        } else {
            router.push(`/workers/${workerId}`)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this worker? This cannot be undone.')) return

        setLoading(true)
        const { error } = await supabase
            .from('workers')
            .delete()
            .eq('id', workerId)

        if (error) {
            alert('Error deleting worker: ' + error.message)
            setLoading(false)
        } else {
            router.push('/workers')
        }
    }

    if (fetching) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link href={`/workers/${workerId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Back to Details
                    </Link>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Edit Worker</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="btn btn-ghost"
                    style={{ color: 'hsl(var(--destructive))' }}
                    type="button"
                >
                    <Trash2 size={18} style={{ marginRight: '0.5rem' }} /> Delete
                </button>
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
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'hsl(var(--background))', color: 'inherit', border: '1px solid hsl(var(--border))', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ paddingTop: '1rem', paddingBottom: '1rem', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Assignment & Status</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Status</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={formData.status === 'active'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Active</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href={`/workers/${workerId}`} className="btn btn-ghost" style={{ border: '1px solid hsl(var(--border))' }}>Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '0.5rem' }}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
