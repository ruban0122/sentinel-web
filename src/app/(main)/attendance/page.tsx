import { createClient } from '@/lib/supabase/server'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import { User, MapPin, Wifi, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import AttendanceSyncButton from '@/components/attendance/AttendanceSyncButton'
import AttendanceTabs from '@/components/attendance/AttendanceTabs'

export default async function AttendancePage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string; date?: string }>
}) {
    const supabase = await createClient()
    const companyId = await getCurrentUserCompanyId()
    const { tab = 'today', date } = await searchParams

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

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const selectedDate = date || todayStr

    // ── Attendance records ──────────────────────────────────────────────────
    const { data: attendanceLogs } = await supabase
        .from('attendance')
        .select(`
            *,
            workers(name, rfid_tag),
            sites(name)
        `)
        .eq('company_id', companyId)
        .gte('date', `${selectedDate}T00:00:00.000Z`)
        .lte('date', `${selectedDate}T23:59:59.999Z`)
        .order('check_in_time', { ascending: false })

    // ── Live RFID Log feed (last 20 events) ────────────────────────────────
    const { data: rfidLogs } = await supabase
        .from('updated_rfid_log')
        .select('*')
        .order('id', { ascending: false })
        .limit(20)

    // ── Stats ───────────────────────────────────────────────────────────────
    const presentCount = attendanceLogs?.filter(a => a.check_in_time && !a.check_out_time).length || 0
    const checkedOutCount = attendanceLogs?.filter(a => a.check_out_time).length || 0
    const totalToday = attendanceLogs?.length || 0

    // ── Unmatched tags (tags in rfid_log with no worker) ───────────────────
    const rfidTags = [...new Set(rfidLogs?.map(l => l.tag_hex) || [])]
    const { data: knownWorkers } = await supabase
        .from('workers')
        .select('rfid_tag')
        .in('rfid_tag', rfidTags)
    const knownTags = new Set(knownWorkers?.map(w => w.rfid_tag) || [])
    const unmatchedTags = rfidTags.filter(t => !knownTags.has(t))

    return (
        <div>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Attendance</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                        RFID-powered workforce tracking
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Date picker */}
                    <form>
                        <input
                            type="date"
                            name="date"
                            defaultValue={selectedDate}
                            style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        />
                    </form>
                    <AttendanceSyncButton />
                </div>
            </div>

            {/* ── Alert: unmatched tags ────────────────────────────────────── */}
            {unmatchedTags.length > 0 && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '0.875rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    background: 'hsla(38, 92%, 50%, 0.1)',
                    border: '1px solid hsla(38, 92%, 50%, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={18} style={{ color: 'hsl(38, 92%, 50%)', flexShrink: 0 }} />
                    <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(38, 92%, 50%)' }}>
                            {unmatchedTags.length} unregistered RFID tag{unmatchedTags.length > 1 ? 's' : ''} detected
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginLeft: '0.5rem' }}>
                            {unmatchedTags.slice(0, 3).join(', ')}{unmatchedTags.length > 3 ? ` +${unmatchedTags.length - 3} more` : ''}
                        </span>
                    </div>
                    <Link
                        href="/workers/add"
                        style={{
                            marginLeft: 'auto',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            background: 'hsla(38, 92%, 50%, 0.15)',
                            color: 'hsl(38, 92%, 50%)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Register Workers
                    </Link>
                </div>
            )}

            {/* ── Stats Row ────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <MiniStatCard label="Total Records" value={totalToday} color="blue" />
                <MiniStatCard label="Currently Present" value={presentCount} color="green" pulse />
                <MiniStatCard label="Checked Out" value={checkedOutCount} color="gray" />
                <MiniStatCard label="RFID Events Today" value={rfidLogs?.filter(l => l.work_date === selectedDate).length || 0} color="purple" />
            </div>

            {/* ── Main Grid ─────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

                {/* ── Attendance Table ─────────────────────────────────────── */}
                <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Attendance Records</h3>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            background: 'hsla(142, 71%, 45%, 0.1)',
                            color: 'hsl(142, 71%, 45%)',
                            fontWeight: 600
                        }}>
                            {totalToday} records
                        </span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <style>{`
                            .attendance-table tbody tr:hover { background: hsla(var(--muted), 0.2); }
                        `}</style>
                        <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '560px' }}>
                            <thead>
                                <tr style={{ background: 'hsla(var(--muted), 0.3)' }}>
                                    {['Worker', 'Check In', 'Check Out', 'Duration', 'Site', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', fontWeight: 600, letterSpacing: '0.05em' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceLogs?.map((log: any) => {
                                    const isPresent = log.check_in_time && !log.check_out_time
                                    const durationMin = log.duration_minutes
                                    const durationStr = durationMin
                                        ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
                                        : '—'
                                    return (
                                        <tr key={log.id} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.15s' }}>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <User size={13} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.workers?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>{log.rfid_tag?.slice(-8) || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                                                {log.check_in_time
                                                    ? <span style={{ color: 'hsl(142, 71%, 45%)', fontWeight: 500 }}>{new Date(log.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    : '—'}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                                                {log.check_out_time
                                                    ? <span style={{ color: 'hsl(var(--muted-foreground))' }}>{new Date(log.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    : <span style={{ color: 'hsla(142, 71%, 45%, 0.7)', fontSize: '0.75rem' }}>Still on site</span>}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {durationStr}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                                                    <MapPin size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                    {log.sites?.name || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: isPresent ? 'hsla(142, 71%, 45%, 0.12)' : 'hsla(var(--muted), 0.6)',
                                                    color: isPresent ? 'hsl(142, 71%, 45%)' : 'hsl(var(--muted-foreground))',
                                                }}>
                                                    {isPresent
                                                        ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(142, 71%, 45%)', display: 'inline-block', animation: 'pulse 2s infinite' }} />Present</>
                                                        : 'Checked Out'
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {(!attendanceLogs || attendanceLogs.length === 0) && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                            <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
                                            No attendance records for this date.
                                            <br />
                                            <span style={{ fontSize: '0.75rem' }}>RFID events will appear here after syncing.</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Live RFID Feed ───────────────────────────────────────── */}
                <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Wifi size={15} style={{ color: 'hsl(142, 71%, 45%)' }} />
                            <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Live RFID Feed</h3>
                        </div>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'hsl(142, 71%, 45%)',
                            display: 'inline-block',
                            boxShadow: '0 0 0 3px hsla(142, 71%, 45%, 0.25)',
                            animation: 'pulse 2s infinite'
                        }} />
                    </div>
                    <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                        {rfidLogs && rfidLogs.length > 0 ? (
                            <div>
                                {rfidLogs.map((log: any) => {
                                    const isCheckIn = log.attendance?.toLowerCase().includes('check in')
                                    const isKnown = knownTags.has(log.tag_hex)
                                    return (
                                        <div key={log.id} style={{
                                            padding: '0.875rem 1.25rem',
                                            borderBottom: '1px solid hsla(var(--border), 0.5)',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'flex-start'
                                        }}>
                                            <div style={{
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '50%',
                                                background: isCheckIn
                                                    ? 'hsla(142, 71%, 45%, 0.12)'
                                                    : 'hsla(0, 71%, 55%, 0.12)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {isCheckIn
                                                    ? <CheckCircle size={14} style={{ color: 'hsl(142, 71%, 45%)' }} />
                                                    : <XCircle size={14} style={{ color: 'hsl(0, 71%, 55%)' }} />
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: isCheckIn ? 'hsl(142, 71%, 45%)' : 'hsl(0, 71%, 55%)'
                                                    }}>
                                                        {isCheckIn ? 'Check In' : 'Check Out'}
                                                    </span>
                                                    {!isKnown && (
                                                        <span style={{
                                                            fontSize: '0.6rem',
                                                            padding: '0.1rem 0.4rem',
                                                            borderRadius: '1rem',
                                                            background: 'hsla(38, 92%, 50%, 0.1)',
                                                            color: 'hsl(38, 92%, 50%)',
                                                            fontWeight: 600
                                                        }}>
                                                            UNKNOWN
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'hsl(var(--muted-foreground))', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.tag_hex}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    {new Date(log.event_time).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                <Wifi size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
                                <p>No RFID events received yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

function MiniStatCard({ label, value, color, pulse }: {
    label: string
    value: number
    color: 'blue' | 'green' | 'gray' | 'purple'
    pulse?: boolean
}) {
    const colors = {
        blue: { text: 'hsl(220, 70%, 60%)', bg: 'hsla(220, 70%, 60%, 0.1)', border: 'hsla(220, 70%, 60%, 0.2)' },
        green: { text: 'hsl(142, 71%, 45%)', bg: 'hsla(142, 71%, 45%, 0.1)', border: 'hsla(142, 71%, 45%, 0.2)' },
        gray: { text: 'hsl(var(--muted-foreground))', bg: 'hsla(var(--muted), 0.3)', border: 'hsla(var(--border), 0.5)' },
        purple: { text: 'hsl(270, 60%, 65%)', bg: 'hsla(270, 60%, 65%, 0.1)', border: 'hsla(270, 60%, 65%, 0.2)' },
    }
    const c = colors[color]
    return (
        <div className="card glass-panel" style={{ padding: '1.125rem 1.25rem', borderColor: c.border }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: c.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {value}
                {pulse && value > 0 && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.text, boxShadow: `0 0 0 3px ${c.bg}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>{label}</div>
        </div>
    )
}
