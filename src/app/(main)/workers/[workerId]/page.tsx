import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Edit, MapPin, Tag, User, Hash, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function WorkerDetailsPage({ params }: { params: Promise<{ workerId: string }> }) {
    const { workerId } = await params
    const supabase = await createClient()

    const { data: worker } = await supabase
        .from('workers')
        .select(`
            *,
            sites(name)
        `)
        .eq('id', workerId)
        .single()

    if (!worker) {
        notFound()
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Link href="/workers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Back to Workers
                    </Link>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>{worker.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'hsl(var(--muted-foreground))' }}>
                        <Hash size={16} />
                        <span>{worker.worker_code || 'No Code'}</span>
                    </div>
                </div>
                <Link href={`/workers/${workerId}/edit`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Edit size={16} /> Edit Worker
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {/* Status Card */}
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} /> Status & Access
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>Current Status</span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                background: worker.status === 'active' ? 'hsla(142, 71%, 45%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)',
                                color: worker.status === 'active' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                display: 'inline-block'
                            }}>
                                {worker.status || 'Unknown'}
                            </span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>RFID Tag ID</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', background: 'hsl(var(--muted))', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                                <Tag size={14} />
                                {worker.rfid_tag || 'Not Assigned'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Card */}
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} /> Location Assignment
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>Assigned Site</span>
                            <div style={{ fontWeight: 500 }}>{worker.sites?.name || 'Unassigned'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>Section/Floor</span>
                            <div style={{ fontWeight: 500 }}>{worker.section || worker.floor || 'Not Specified'}</div>
                        </div>
                    </div>
                </div>

                {/* Meta Card */}
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={18} /> Metadata
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>Created At</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} className="text-muted-foreground" />
                                {new Date(worker.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.25rem' }}>Worker ID</span>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{worker.id}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
