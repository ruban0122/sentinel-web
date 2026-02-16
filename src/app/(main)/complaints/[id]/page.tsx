import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, User, MapPin, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StatusSelect } from '@/components/shared/StatusSelect'

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Complaint Details
    const { data: complaint, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !complaint) {
        notFound()
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Back to Complaints
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'hsla(30, 80%, 55%, 0.1)', color: 'hsl(30, 80%, 55%)' }}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Complaint Details</h1>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>ID: {complaint.id}</span>
                    </div>

                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <StatusSelect tableName="complaints" id={complaint.id} initialStatus={complaint.status} />
                        {complaint.status_updated_at && (
                            <p suppressHydrationWarning style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                Updated by {complaint.status_updated_by || 'Unknown'} <br />
                                {new Date(complaint.status_updated_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Date</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <Calendar size={16} />
                            <span>{new Date(complaint.date || complaint.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Worker / Reporter</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <User size={16} />
                            <span>{complaint.worker_name || 'Anonymous'}</span>
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <MapPin size={16} />
                            <span>{complaint.site_name || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Message</h3>
                    <p style={{ lineHeight: 1.6, color: 'hsl(var(--foreground))' }}>
                        {complaint.description}
                    </p>
                </div>

                {complaint.image_url && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Attached Image</h3>
                        <img src={complaint.image_url} alt="Evidence" style={{ maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} />
                    </div>
                )}
            </div>
        </div>
    )
}
