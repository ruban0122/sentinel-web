import { createClient } from '@/lib/supabase/server'
import { Download } from 'lucide-react'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Simple Summary Report Logic
    const today = new Date().toISOString().split('T')[0]

    const [
        { count: totalWorkers },
        { count: totalIncidents },
        { data: attendance }
    ] = await Promise.all([
        supabase.from('workers').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('status').gte('date', today)
    ])

    const presentCount = attendance?.filter(a => a.status === 'present').length || 0


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reports & Analytics</h1>
                <button className="btn btn-ghost" style={{ border: '1px solid hsl(var(--border))', gap: '0.5rem' }}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Total Workforce</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{totalWorkers || 0}</p>
                </div>
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Incidents Reported</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{totalIncidents || 0}</p>
                </div>
                <div className="card glass-panel">
                    <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Present Today</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{presentCount || 0}</p>
                </div>
            </div>

            <div className="card glass-panel">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Payroll Estimation (Example)</h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                    Estimated hours based on Check-in/Check-out logs.
                </p>
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)' }}>
                    Detailed Payroll Table coming soon.
                </div>
            </div>
        </div>
    )
}
