import { createClient } from '@/lib/supabase/server'
import { Plus, Upload, Filter } from 'lucide-react'
import Link from 'next/link'
import { WorkerToolbar } from './worker-toolbar'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'

export default async function WorkersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; site?: string; status?: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const siteId = params.site || ''
    const status = params.status || ''
    const supabase = await createClient()

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

    // Query Building - FILTER BY COMPANY
    let dbQuery = supabase
        .from('workers')
        .select(`
            *,
            sites(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,rfid_tag.ilike.%${query}%,worker_code.ilike.%${query}%`)
    }

    if (siteId) {
        dbQuery = dbQuery.eq('site_id', siteId)
    }

    if (status) {
        dbQuery = dbQuery.eq('status', status)
    }

    // Parallel Fetching
    const [workersResult, sitesResult] = await Promise.all([
        dbQuery,
        supabase
            .from('sites')
            .select('id, name')
            .eq('company_id', companyId)
            .order('name')
    ])

    const workers = workersResult.data
    const sites = sitesResult.data

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Workers Management</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/workers/import" className="btn btn-ghost" style={{ gap: '0.5rem', border: '1px solid hsl(var(--border))' }}>
                        <Upload size={18} />
                        Import
                    </Link>
                    <Link href="/workers/add" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        <Plus size={18} />
                        Add Worker
                    </Link>
                </div>
            </div>

            <WorkerToolbar sites={sites || []} />

            <div className="card glass-panel" style={{ padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--muted), 0.3)' }}>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>RFID Tag</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Worker Code</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Site</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers?.map((worker: any) => (
                                <tr key={worker.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {worker.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{worker.name || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{worker.rfid_tag || '-'}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{worker.worker_code || '-'}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{worker.sites?.name || '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            background: worker.status === 'active' ? 'hsla(142, 71%, 45%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)',
                                            color: worker.status === 'active' ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'capitalize'
                                        }}>
                                            {worker.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/workers/${worker.id}`} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', height: 'auto', fontSize: '0.75rem' }}>
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!workers || workers.length === 0) && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsla(var(--muted), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Filter size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500 }}>No workers found</p>
                                                <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or search query.</p>
                                            </div>
                                        </div>
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
