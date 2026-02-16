import { Users, UserCheck, UserX, Clock, Building2, MapPin, TrendingUp, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import Link from 'next/link'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
    const supabase = await createClient()
    const companyId = await getCurrentUserCompanyId()
    const { site: selectedSiteId } = await searchParams

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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Prepare Queries
    let todayAttendanceQuery = supabase
        .from('attendance')
        .select('*')
        .eq('company_id', companyId)
        .gte('check_in_time', today.toISOString())
        .lt('check_in_time', tomorrow.toISOString())

    let recentAttendanceQuery = supabase
        .from('attendance')
        .select(`
            id,
            worker_code,
            status,
            check_in_time,
            check_out_time,
            workers(name)
        `)
        .eq('company_id', companyId)
        .order('check_in_time', { ascending: false })
        .limit(10)

    let sitesQuery = supabase
        .from('sites')
        .select(`
            id,
            name,
            status,
            workers:workers(count)
        `)
        .eq('company_id', companyId)
        .order('name')

    // Apply Filters
    if (selectedSiteId) {
        todayAttendanceQuery = todayAttendanceQuery.eq('site_id', selectedSiteId)
        recentAttendanceQuery = recentAttendanceQuery.eq('site_id', selectedSiteId)
        sitesQuery = sitesQuery.eq('id', selectedSiteId)
    }

    // Fetch dashboard data
    const [
        { count: totalWorkers },
        { data: todayAttendance },
        { data: sites },
        { data: recentAttendance }
    ] = await Promise.all([
        // Total workers in company (Always Company-wide for now unless we have direct site_id on workers)
        // If we want site-specific workers, we'd need to know if workers has site_id.
        // For dashboard integrity, "Total Workers" usually means "Total Workforce Available".
        // "Present Today" will be filtered by site.
        supabase
            .from('workers')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId),

        todayAttendanceQuery,
        sitesQuery,
        recentAttendanceQuery
    ])

    // Calculate stats
    const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0
    // If viewing a specific site, 'Total Workers' for absent calc should probably be 'Total Workers Assigned to Site'
    // But since we don't have that count easily separate from 'sites' query, we can try to use site workers count IF single site selected.

    let relevantTotalWorkers = totalWorkers || 0
    if (selectedSiteId && sites && sites.length === 1) {
        // Use the count from the site Query
        relevantTotalWorkers = sites[0].workers?.[0]?.count || 0
    }

    const absentToday = Math.max(0, relevantTotalWorkers - presentToday)
    const attendanceRate = relevantTotalWorkers > 0 ? Math.round((presentToday / relevantTotalWorkers) * 100) : 0

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard Overview</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {selectedSiteId && sites?.[0] ? `Viewing data for ${sites[0].name}` : "Welcome back! Here's what's happening today."}
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title={selectedSiteId ? "Workers on Site" : "Total Workers"}
                    value={relevantTotalWorkers.toString()}
                    icon={Users}
                    trend={selectedSiteId ? "" : `${relevantTotalWorkers} registered`}
                    color="blue"
                />
                <StatCard
                    title="Present Today"
                    value={presentToday.toString()}
                    icon={UserCheck}
                    trend={`${attendanceRate}% attendance rate`}
                    color="green"
                    isActive
                />
                <StatCard
                    title="Absent Today"
                    value={absentToday.toString()}
                    icon={UserX}
                    trend={`${100 - attendanceRate}% absent`}
                    color="red"
                />
                <StatCard
                    title="Active Sites"
                    value={(selectedSiteId ? 1 : sites?.filter(s => s.status === 'active').length || 0).toString()}
                    icon={Building2}
                    trend={selectedSiteId ? sites?.[0]?.name || 'Unknown' : `${sites?.length || 0} total sites`}
                    color="purple"
                />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Activity</h3>
                        <Link href="/attendance" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', height: 'auto' }}>
                            View All
                        </Link>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {recentAttendance && recentAttendance.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {recentAttendance.map((record) => (
                                    <div
                                        key={record.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid hsla(var(--border), 0.5)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                height: '2.5rem',
                                                width: '2.5rem',
                                                borderRadius: '50%',
                                                background: record.status === 'present' ? 'hsla(142, 76%, 36%, 0.1)' : 'hsla(var(--muted), 0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${record.status === 'present' ? 'hsla(142, 76%, 36%, 0.2)' : 'hsla(var(--border), 0.5)'}`
                                            }}>
                                                {record.status === 'present' ? (
                                                    <UserCheck size={16} style={{ color: 'hsl(142, 76%, 36%)' }} />
                                                ) : (
                                                    <Clock size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                    {(Array.isArray(record.workers) ? record.workers[0]?.name : (record.workers as any)?.name) || record.worker_code}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    {new Date(record.check_in_time).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            background: record.status === 'present' ? 'hsla(142, 76%, 36%, 0.1)' : 'hsla(var(--muted), 0.5)',
                                            color: record.status === 'present' ? 'hsl(142, 76%, 36%)' : 'hsl(var(--muted-foreground))',
                                            fontWeight: 500,
                                            textTransform: 'capitalize'
                                        }}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Site Status */}
                <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Site Status</h3>
                        <Link href="/settings/sites" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', height: 'auto' }}>
                            Manage
                        </Link>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {sites && sites.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {sites.map((site) => (
                                    <div
                                        key={site.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid hsla(var(--border), 0.5)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                height: '2.5rem',
                                                width: '2.5rem',
                                                borderRadius: '0.5rem',
                                                background: 'hsla(var(--primary), 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid hsla(var(--primary), 0.2)'
                                            }}>
                                                <MapPin size={16} style={{ color: 'hsl(var(--primary))' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{site.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    {site.workers?.[0]?.count || 0} workers
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            background: site.status === 'active' ? 'hsla(142, 76%, 36%, 0.1)' : 'hsla(var(--muted), 0.5)',
                                            color: site.status === 'active' ? 'hsl(142, 76%, 36%)' : 'hsl(var(--muted-foreground))',
                                            fontWeight: 500,
                                            textTransform: 'capitalize'
                                        }}>
                                            {site.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                <Building2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                <p>No sites configured</p>
                                <Link href="/settings/sites/add" className="btn btn-primary" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                                    Add First Site
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    isActive = false
}: {
    title: string
    value: string
    icon: any
    trend: string
    color?: 'blue' | 'green' | 'red' | 'purple'
    isActive?: boolean
}) {
    const colorMap = {
        blue: 'hsl(220, 70%, 50%)',
        green: 'hsl(150, 60%, 40%)',
        red: 'hsl(350, 80%, 60%)',
        purple: 'hsl(270, 60%, 60%)'
    }

    const bgColorMap = {
        blue: 'hsla(220, 70%, 50%, 0.1)',
        green: 'hsla(150, 60%, 40%, 0.1)',
        red: 'hsla(350, 80%, 60%, 0.1)',
        purple: 'hsla(270, 60%, 60%, 0.1)'
    }

    return (
        <div
            className="card glass-panel"
            style={{
                padding: '1.5rem',
                ...(isActive ? {
                    borderColor: colorMap[color],
                    boxShadow: `0 0 0 1px ${colorMap[color]}`
                } : {})
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                        {value}
                    </h3>
                </div>
                <div style={{
                    height: '3rem',
                    width: '3rem',
                    borderRadius: '0.75rem',
                    background: bgColorMap[color],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${colorMap[color]}20`
                }}>
                    <Icon size={24} style={{ color: colorMap[color] }} />
                </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                {trend}
            </p>
        </div>
    )
}
