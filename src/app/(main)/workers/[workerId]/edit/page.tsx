'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, Building2, Layers } from 'lucide-react'
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
        status: 'active'
    })

    const [companyId, setCompanyId] = useState<string | null>(null)
    const [contractors, setContractors] = useState<any[]>([])
    const [floors, setFloors] = useState<any[]>([])
    const [selectedContractor, setSelectedContractor] = useState('')
    const [selectedFloor, setSelectedFloor] = useState('')
    
    // To prevent the contractor effect from overwriting our initial lookup
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        async function loadData() {
            setFetching(true)

            // Get current user and their company_id from profile
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('users')
                .select('company_id')
                .eq('uid', user.id)
                .single()

            const cid = profile?.company_id
            setCompanyId(cid)

            if (cid) {
                // Fetch contractors for this company
                const { data: contractorsData } = await supabase
                    .from('contractors')
                    .select('id, name, company_worker_code, floor_id')
                    .eq('company_id', cid)
                    .order('name')

                if (contractorsData) setContractors(contractorsData)
            }

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
                    status: worker.status || 'active',
                })
                
                // Attempt to reverse lookup floor and contractor
                if (worker.section_id) {
                    const { data: floor } = await supabase
                        .from('floors')
                        .select('id')
                        .eq('section_id', worker.section_id)
                        .limit(1)
                        .maybeSingle()
                        
                    if (floor) {
                        setSelectedFloor(floor.id)
                        
                        if (cid) {
                            const { data: contractor } = await supabase
                                .from('contractors')
                                .select('id')
                                .eq('floor_id', floor.id)
                                .eq('company_id', cid)
                                .limit(1)
                                .maybeSingle()
                            
                            if (contractor) {
                                setSelectedContractor(contractor.id)
                            }
                        }
                    }
                }
            } else if (error) {
                console.error(error)
                alert('Error loading worker')
                router.push('/workers')
            }
            
            setFetching(false)
            // Allow standard effects to take over after initial data binding
            setTimeout(() => setIsInitialLoad(false), 500)
        }
        loadData()
    }, [workerId, supabase, router])

    // Fetch floor when contractor is selected (behavior matched with add flow)
    useEffect(() => {
        if (isInitialLoad) return // Don't wipe pre-selected data during initialization
        
        async function fetchFloorForContractor() {
            if (!selectedContractor) {
                setFloors([])
                setSelectedFloor('')
                return
            }

            const contractor = contractors.find(c => c.id === selectedContractor)
            if (!contractor?.floor_id) {
                setFloors([])
                setSelectedFloor('')
                return
            }

            // Fetch the specific floor assigned to this contractor
            const { data: floorData } = await supabase
                .from('floors')
                .select(`
                    id, 
                    name, 
                    floor_code,
                    section_id,
                    sections(id, name, site_id, sites(name))
                `)
                .eq('id', contractor.floor_id)
                .single()

            if (floorData) {
                setFloors([floorData])
                // Auto-select the floor since there's only one
                setSelectedFloor(floorData.id)
            }
        }
        fetchFloorForContractor()
    }, [selectedContractor, contractors, supabase, isInitialLoad])
    
    // Fallback: If we have an initial floor selected but floors array is empty, fetch that floor for display
    useEffect(() => {
        async function fetchInitialFloor() {
            if (isInitialLoad && selectedFloor && floors.length === 0) {
                const { data: floorData } = await supabase
                    .from('floors')
                    .select(`
                        id, 
                        name, 
                        floor_code,
                        section_id,
                        sections(id, name, site_id, sites(name))
                    `)
                    .eq('id', selectedFloor)
                    .single()
                    
                if (floorData) {
                    setFloors([floorData])
                }
            }
        }
        fetchInitialFloor()
    }, [selectedFloor, isInitialLoad, floors.length, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!companyId || !selectedContractor || !selectedFloor) {
            alert('Please select a contractor and floor assignment.')
            return
        }

        setLoading(true)

        const floor = floors.find(f => f.id === selectedFloor)

        const updateData = {
            name: formData.name,
            worker_code: formData.worker_code,
            rfid_tag: formData.rfid_tag,
            status: formData.status,
            site_id: floor?.sections?.site_id,
            section_id: floor?.section_id,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('workers')
            .update(updateData)
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
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
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
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>RFID Tag ID *</label>
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

                <div style={{ paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Assignment</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Contractor Selection */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                marginBottom: '0.5rem'
                            }}>
                                <Building2 size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                Contractor *
                            </label>
                            <select
                                value={selectedContractor}
                                onChange={(e) => setSelectedContractor(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'hsl(var(--background))',
                                    color: 'inherit',
                                    border: '1px solid hsl(var(--border))',
                                    outline: 'none'
                                }}
                            >
                                <option value="">Select a contractor...</option>
                                {contractors.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.company_worker_code && `(${c.company_worker_code})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Floor Selection */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                marginBottom: '0.5rem'
                            }}>
                                <Layers size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                Floor Assignment *
                            </label>
                            <select
                                value={selectedFloor}
                                onChange={(e) => setSelectedFloor(e.target.value)}
                                disabled={!selectedContractor || floors.length === 0}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: selectedFloor ? 'hsl(var(--muted))' : 'hsl(var(--background))',
                                    color: 'inherit',
                                    border: '1px solid hsl(var(--border))',
                                    outline: 'none',
                                    cursor: !selectedContractor ? 'not-allowed' : 'default',
                                    opacity: !selectedContractor ? 0.6 : 1
                                }}
                            >
                                {!selectedContractor ? (
                                    <option value="">Select a contractor first...</option>
                                ) : floors.length === 0 ? (
                                    <option value="">No floor assigned to this contractor</option>
                                ) : (
                                    floors.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.floor_code}) - {f.sections?.sites?.name || 'Unknown Site'}
                                        </option>
                                    ))
                                )}
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                {selectedFloor
                                    ? '✓ Floor automatically assigned based on contractor'
                                    : 'Floor will be auto-selected when you choose a contractor'
                                }
                            </p>
                        </div>

                        {/* Status */}
                        <div style={{ marginTop: '0.5rem' }}>
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
                    <button type="submit" className="btn btn-primary" disabled={loading || !selectedContractor || !selectedFloor} style={{ gap: '0.5rem' }}>
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
