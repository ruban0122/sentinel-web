import { createClient } from '@/lib/supabase/server'
import { Plus, MessageSquare, MapPin, Calendar, Clock, CheckCircle2, PlayCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Suspense } from 'react'

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const supabase = await createClient()
    const { tab } = await searchParams
    const currentTab = tab || 'active'

    // Get user's company_id
    const companyId = await getCurrentUserCompanyId()

    if (!companyId) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Your account is not associated with a company.
                </p>
            </div>
        )
    }

    let query = supabase
        .from('complaints')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

    if (currentTab === 'resolved') {
        query = query.in('status', ['resolved', 'dismissed'])
    } else {
        query = query.or('status.in.(pending,in_progress),status.is.null')
    }

    const { data: complaints, error } = await query

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 size={16} />
            case 'in_progress': return <PlayCircle size={16} />
            case 'dismissed': return <XCircle size={16} />
            default: return <Clock size={16} />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'hsl(142, 70%, 50%)'
            case 'in_progress': return 'hsl(210, 80%, 60%)'
            case 'dismissed': return 'hsl(var(--muted-foreground))'
            default: return 'hsl(30, 80%, 55%)' // Orange
        }
    }

    const getStatusLabel = (status: string) => {
        return status ? status.replace('_', ' ') : 'Pending'
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Complaints</h1>
                <Link href="/complaints/create" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={18} />
                    New Complaint
                </Link>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <StatusTabs />
            </Suspense>

            <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsla(var(--muted), 0.3)' }}>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Status</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Date</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Reporter / Worker</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Description</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Site</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints?.map((complaint: any) => (
                                <tr key={complaint.id} className="hover-row" style={{ borderBottom: '1px solid hsla(var(--border), 0.5)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '0.75rem 1.5rem' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '99px',
                                            background: `${getStatusColor(complaint.status || 'pending')}15`,
                                            color: getStatusColor(complaint.status || 'pending'),
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'capitalize'
                                        }}>
                                            {getStatusIcon(complaint.status || 'pending')}
                                            {getStatusLabel(complaint.status)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem', color: 'hsl(var(--foreground))' }}>
                                        {new Date(complaint.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>
                                        {complaint.worker_name || 'Anonymous'}
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem', maxWidth: '300px' }}>
                                        <p style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, color: 'hsl(var(--muted-foreground))' }}>
                                            {complaint.description}
                                        </p>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <MapPin size={14} />
                                            {complaint.site_name || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                                        <Link
                                            href={`/complaints/${complaint.id}`}
                                            className="btn btn-ghost"
                                            style={{ padding: '0.375rem 0.75rem', height: 'auto', fontSize: '0.75rem', gap: '0.25rem' }}
                                        >
                                            View <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {(!complaints || complaints.length === 0) && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                                        No {currentTab} complaints found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
