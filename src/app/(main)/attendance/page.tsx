import { createClient } from '@/lib/supabase/server'
import { Calendar, User, MapPin } from 'lucide-react'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'

export default async function AttendancePage() {
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

    // Fetch today's logs - FILTER BY COMPANY
    const today = new Date().toISOString().split('T')[0]

    const { data: attendance_logs, error } = await supabase
        .from('attendance')
        .select(`
        *,
        workers(name, rfid_tag),
        sites(name)
    `)
        .eq('company_id', companyId)
        .gte('date', today)
        .order('check_in_time', { ascending: false })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Today's Attendance</h1>
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'hsl(var(--muted))', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="card glass-panel" style={{ padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--muted), 0.3)' }}>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Worker</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Check In</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Check Out</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Site</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance_logs?.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', background: 'hsl(var(--muted))', borderRadius: '50%' }}><User size={14} /></div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.workers?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>{log.rfid_tag}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <MapPin size={14} className="text-muted-foreground" />
                                            {log.sites?.name || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            background: !log.check_out_time ? 'hsla(142, 71%, 45%, 0.1)' : 'hsla(var(--muted), 1)',
                                            color: !log.check_out_time ? 'hsl(142, 71%, 45%)' : 'hsl(var(--muted-foreground))',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {!log.check_out_time ? 'Present' : 'Checked Out'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!attendance_logs || attendance_logs.length === 0) && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                        No attendance records for today.
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
